{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-23.11";
    systems.url = "github:nix-systems/default";
    rust-overlay.url = "github:oxalica/rust-overlay";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    fenix = {
      url = "github:nix-community/fenix";
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
    rust-overlay,
    devenv,
    ...
  } @ inputs: let
    overlays = [(import rust-overlay)];
    forEachSystem = nixpkgs.lib.genAttrs (import systems);
    postgresPort = 5566;
    postgresHost = "127.0.0.1";
  in {
    packages = forEachSystem (
      system: let
        # dbPort = "5433";
        pkgs = import nixpkgs {inherit system overlays;};
        rustVersion = pkgs.rust-bin.stable.latest.default;
        rustPlatform = pkgs.makeRustPlatform {
          cargo = rustVersion;
          rustc = rustVersion;
        };
        sanitasBackendPackage = rustPlatform.buildRustPackage {
          pname = "sanitas_backend";
          version = "0.1.0";
          src = ./backend;
          cargoLock.lockFile = ./backend/Cargo.lock;
        };
      in {
        # For setting up devenv
        devenv-up = self.devShells.${system}.default.config.procfileScript;

        # Sanitas backend docker image, generate it using:
        # `nix run .#sanitasBackendDocker`
        sanitasBackendDocker = pkgs.dockerTools.buildImage {
          name = "sanitas_backend_img";
          tag = "latest";

          copyToRoot = pkgs.buildEnv {
            name = "image-root";
            paths = [sanitasBackendPackage];
            pathsToLink = ["/"];
          };

          config = {
            Cmd = [
              "/${sanitasBackendPackage}/bin/sanitas_backend"
            ];
          };
        };

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
      pkgs = import nixpkgs {inherit system overlays;};
      strFromDBFile = file: builtins.readFile ./database/${file};
      dbInitFile = builtins.concatStringsSep "\n" [(strFromDBFile "init.sql") (strFromDBFile "tables.sql") (strFromDBFile "inserts.sql")];
    in {
      default = devenv.lib.mkShell {
        inherit pkgs inputs;
        modules = [
          {
            packages = with pkgs; [
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
