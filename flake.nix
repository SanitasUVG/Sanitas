{
  description = "Sanitas Flake for reproducible builds and environments!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
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

        buildJSDoc = pkgs.writeShellApplication {
          name = "Sanitas JSdoc builder";
          runtimeInputs = with pkgs; [nodePackages.jsdoc ansi];
          text = ''
            echo -e "$(ansi yellow)"WARNING:"$(ansi reset)" We need sudo to copy the font from the nix store!
            sudo echo "Sudo thanks! ;-)"

            echo -e "$(ansi yellow)"WARNING:"$(ansi reset)" This script must be run on the project root directory!
            sudo jsdoc -c conf.json --recurse .
          '';
        };
      }
    );

    devShells = forEachSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      requiredPkgs = with pkgs; [
        dprint
        oxlint
        jq
      ];
      frontendRequiredPkgs = with pkgs; [
        nodejs_20
        yarn-berry
      ];
      backendRequiredPkgs = with pkgs; [
        awscli2
        aws-sam-cli
      ];
      strFromDBFile = file: builtins.readFile ./database/${file};
      dbInitFile = builtins.concatStringsSep "\n" [(strFromDBFile "init.sql") (strFromDBFile "tables.sql") (strFromDBFile "inserts.sql")];
    in {
      cicdFrontend = pkgs.mkShell {
        packages = requiredPkgs ++ frontendRequiredPkgs;
      };
      cicdBackend = pkgs.mkShell {
        packages = requiredPkgs ++ backendRequiredPkgs;
      };

      default = devenv.lib.mkShell {
        inherit pkgs inputs;
        modules = [
          {
            packages = with pkgs;
              [
                # General
                nodePackages.jsdoc

                # Database
                postgresql
                sqlfluff # SQL linter and formatter
              ]
              ++ requiredPkgs
              ++ frontendRequiredPkgs
              ++ backendRequiredPkgs;

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
              frontend = {
                exec = "cd sanitas_frontend/ && yarn dev";
                # TODO: Uncomment when supported by devenv.
                # process-compose = {
                #   ready_log_line = "ready in";
                # };
              };
              storybook = {
                exec = "cd sanitas_frontend/ && yarn storybook";
                # TODO: Uncomment when supported by devenv.
                # process-compose = {
                #   ready_log_line = "for react-vite started";
                # };
              };
              backend.exec = let
                ipCommand =
                  if builtins.elem system ["x86_64-darwin" "aarch64-darwin"]
                  then "ifconfig en0 | grep 'inet ' | awk '{print $2}'"
                  else "ip route get 1.2.3.4 | awk '{print $7}'";
              in "cd sanitas_backend/ && sam build && sam local start-api --debug --add-host=hostpc:$(${ipCommand})";
              pg_setup = {
                exec = "cat pg_hba.conf > ./.devenv/state/postgres/pg_hba.conf";
                process-compose = {
                  depends_on = {
                    postgres = {
                      condition = "process_healthy";
                    };
                  };
                };
              };
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
                  name = "dprint";
                  description = "Javascript formatter";
                  files = "\.[mc]?jsx?$";
                  entry = "${pkgs.dprint}/bin/dprint fmt --allow-no-files";
                };
                yamlFormatter = {
                  enable = true;
                  name = "yamlfmt";
                  description = "Google Yaml formatter";
                  files = "\.ya?ml$";
                  entry = "${pkgs.yamlfmt}/bin/yamlfmt -formatter type=basic,max_line_length=65,include_document_start=true,retain_line_breaks_single=true,pad_line_comments=2";
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
                  files = "\.[mc]?jsx?$";
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
