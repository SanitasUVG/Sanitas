{
  description = "Sanitas Flake for reproducible builds and environments!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    systems.url = "github:nix-systems/default";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = {
    self,
    nixpkgs,
    systems,
    devenv,
    ...
  } @ inputs: let
    forEachSystem = nixpkgs.lib.genAttrs (import systems);
    postgresPort = 6969;
    postgresHost = "0.0.0.0";
  in {
    packages = forEachSystem (
      system: let
        # dbPort = "5433";
        pkgs = import nixpkgs {inherit system;};
      in {
        # For setting up devenv
        devenv-up = self.devShells.${system}.default.config.procfileScript;

        restartServices = pkgs.writeShellApplication {
          name = "Sanitas dev server restarter";
          runtimeInputs = with pkgs; [ansi];
          text = ''
            echo -e "$(ansi yellow)"WARNING:"$(ansi reset)" This script must be run on the project root directory!

            echo "Trying to remove old .devenv..."
            rm ./.devenv/state/postgres || rm -r ./.devenv/state/postgres || true

            echo "Entering devshell..."
            nix develop --impure . -c devenv up
          '';
        };
      }
    );

    devShells = forEachSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      strFromDBFile = file: builtins.readFile ./database/${file};
      dbInitFile = builtins.concatStringsSep "\n" [(strFromDBFile "init.sql") (strFromDBFile "tables.sql") (strFromDBFile "inserts.sql")];
    in {
      default = devenv.lib.mkShell {
        inherit pkgs inputs;
        modules = [
          {
            packages = with pkgs; [
              # General
              awscli2
              aws-sam-cli
              jq

              # Backend
              nodePackages.serverless

              # Database
              postgresql
              sqlfluff # SQL linter and formatter

              # Frontend
              nodejs_20
              yarn
              dprint # Javascript formatter
              oxlint # Javascript linter
            ];
            enterShell = ''
              alias rm=rip
            '';

            services.postgres = {
              enable = true;
              listen_addresses = postgresHost;
              port = postgresPort;
              initialScript = dbInitFile;
              settings = {
                log_connections = true;
                log_statement = "all";
                logging_collector = true;
                log_disconnections = true;
                log_destination = "stderr";
              };
            };

            processes = {
              frontend.exec = "cd sanitas_frontend/ && yarn dev";
            };

            pre-commit = {
              hooks = {
                # Formatters
                alejandra.enable = true; # Nix
                mdformat = {
                  enable = true;
                  name = "mdformat";
                  description = "A common mark compliant markdown formatter";
                  files = "\.md$";
                  entry = "${pkgs.python310Packages.mdformat}/bin/mdformat";
                };
                sqlFormatter = {
                  enable = true;
                  name = "SQLFluff - Formatter";
                  description = "A multidialect SQL linter and formatter";
                  files = "\.sql$";
                  entry = "${pkgs.sqlfluff}/bin/sqlfluff format --dialect postgres";
                };
                jsformat = {
                  enable = true;
                  name = "dprint JSFormatter";
                  description = "Javascript formatter";
                  files = "\.js$|\.jsx$";
                  entry = "${pkgs.dprint}/bin/dprint output-file-paths && ${pkgs.dprint}/bin/dprint fmt";
                };

                # Linters
                actionlint.enable = true;
                yamllint.enable = true;
                commitizen.enable = true;
                markdownlint.enable = true;
                statix.enable = true;
                sqlLinter = {
                  enable = true;
                  name = "SQLFluff - Linter";
                  description = "A multidialect SQL linter and formatter";
                  files = "\.sql$";
                  entry = "${pkgs.sqlfluff}/bin/sqlfluff lint --dialect postgres";
                };
                jslinter = {
                  enable = true;
                  name = "oxclint JSLinter";
                  description = "Javascript linter written in rust";
                  files = "\.js$|\.jsx$";
                  entry = "${pkgs.oxlint}/bin/oxlint --max-warnings=0 -D correctness -D restriction";
                };
              };
            };
          }
        ];
      };
    });
  };
}
