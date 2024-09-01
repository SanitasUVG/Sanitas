{
  description = "Sanitas Flake for reproducible builds and environments!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    samcliPkgs.url = "github:nixos/nixpkgs/42c5e250a8a9162c3e962c78a4c393c5ac369093";
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
    samcliPkgs,
    ...
  } @ inputs: let
    forEachSystem = nixpkgs.lib.genAttrs (import systems);
    postgresPort = 6969;
    postgresHost = "0.0.0.0";
    strFromDBFile = file: builtins.readFile ./database/${file};
    dbInitFile = builtins.concatStringsSep "\n" [(strFromDBFile "init.sql") (strFromDBFile "tables.sql") (strFromDBFile "inserts.sql")];
  in {
    packages = forEachSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
        samcli = (import samcliPkgs {inherit system;}).aws-sam-cli;
        backendRequiredPkgs = [
          pkgs.awscli2
          samcli
        ];
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

        integrationTests = pkgs.writeShellApplication {
          name = "Sanitas integration tests";
          runtimeInputs = [pkgs.docker pkgs.process-compose pkgs.unixtools.ifconfig] ++ backendRequiredPkgs;
          text = let
            PGDATA = "./.devenv/state/postgres/";
            startBackend = let
              ipCommand =
                if builtins.elem system ["x86_64-darwin" "aarch64-darwin"]
                then "ifconfig en0 | grep 'inet ' | cut -d' ' -f2"
                else "ip route get 1.2.3.4 | awk '{print $7}'";
            in ''
              set -euo pipefail
              cd sanitas_backend/

              echo Starting backend
              echo Getting ifconfig
              ifconfig en0
              echo Grepping for inet
              ifconfig en0 | grep 'inet '
              echo Using AWK
              awk --version
              echo -e "ifconfig en0 | grep 'inet ' | cut -d' ' -f2"
              ifconfig en0 | grep 'inet ' | cut -d' ' -f2

              echo Building backend
              sam build

              sam local start-api --debug --add-host=hostpc:$(${ipCommand})
            '';
            startPostgres = ''
              set -euo pipefail
              rm -rf ./.devenv/state/postgres/
              mkdir -p ./.devenv/state/postgres/
              export PATH=${pkgs.postgresql}/bin:${pkgs.coreutils}/bin

              echo "The PGDATA variable is" $PGDATA
              initdb --locale=C --encoding=UTF8
              POSTGRES_RUN_INITIAL_SCRIPT="true"
              echo
              echo "PostgreSQL initdb process complete."
              echo

              # Setup pg_hba.conf
              echo "Setting up pg_hba"
              cp ${./pg_hba.conf} ./.devenv/state/postgres/pg_hba.conf
              echo "HBA setup complete!"

              echo
              echo "PostgreSQL is setting up the initial database."
              echo
              OLDPGHOST="$PGHOST"
              PGHOST=./.devenv/state/postgres/

              echo "Listing files"
              ls ./.devenv/state/postgres/
              echo "Working in: $PWD"
              echo "Who am I? $(whoami)"
              # touch ./.devenv/state/postgres/.s.PGSQL.6969.lock
              echo Starting server with command: pg_ctl -D ./.devenv/state/postgres/ -w start -o "-c unix_socket_directories=./.devenv/state/postgres/ -c listen_addresses= -p ${builtins.toString postgresPort}"
              pg_ctl -D ./.devenv/state/postgres/ -w start -o "-c unix_socket_directories=/Users/flaviogalan/Documents/Development/Sanitas/.devenv/state/postgres/ -c listen_addresses= -p ${builtins.toString postgresPort}"
              # pg_ctl -D ./.devenv/state/postgres/ -w start -o "-c listen_addresses= -p ${builtins.toString postgresPort}"

              echo "Initializing DB"
              echo "${dbInitFile}" | psql --dbname postgres -h /Users/flaviogalan/Documents/Development/Sanitas/.devenv/state/postgres/ -p ${builtins.toString postgresPort}
              pg_ctl -D "./.devenv/state/postgres/" -m fast -w stop
              PGHOST="$OLDPGHOST"
              unset OLDPGHOST
              echo "Sanitas postgres is now running!"
            '';

            testBackend = "cd ./sanitas_backend/ && npm test -- --runInBand";

            processComposeConfig = {
              version = "0.5";
              # is_tui_disabled = true;
              processes = {
                DB = {
                  command = startPostgres;
                  ready_log_line = "Sanitas postgres is now running!";
                  environment = ["PGDATA=${PGDATA}"]; # Only usefull for initdb
                  availability.restart = "exit_on_failure";
                };
                Backend = {
                  command = startBackend;
                  ready_log_line = "Running on http://127.0.0.1:";
                  availability.restart = "exit_on_failure";
                };
                Test = {
                  command = testBackend;
                  availability = {
                    exit_on_end = true;
                  };
                  depends_on = {
                    DB = {
                      condition = "process_log_ready";
                    };
                    Backend = {
                      condition = "process_log_ready";
                    };
                  };
                };
              };
            };

            processComposeConfigFile = pkgs.writeText "SanitasProcessComposeConfig.yaml" (pkgs.lib.generators.toYAML {} processComposeConfig);
          in ''
            echo ${processComposeConfigFile}
            process-compose -f ${processComposeConfigFile}
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
      samcli = (import samcliPkgs {inherit system;}).aws-sam-cli;
      requiredPkgs = with pkgs; [
        jq
      ];
      frontendRequiredPkgs = with pkgs; [
        nodejs_20
        yarn-berry
      ];
      backendRequiredPkgs = [
        pkgs.awscli2
        samcli
      ];
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
            packages =
              [
                # General
                pkgs.nodePackages.jsdoc

                # Database
                pkgs.postgresql
                pkgs.sqlfluff # SQL linter and formatter
              ]
              ++ requiredPkgs
              ++ frontendRequiredPkgs
              ++ backendRequiredPkgs;

            process = {
              process-compose = pkgs.lib.mkOptionDefault {
                tui = false;
              };
            };

            services.postgres = {
              enable = true;
              listen_addresses = postgresHost;
              port = postgresPort;
              initialScript = dbInitFile;
              hbaConf = builtins.readFile ./pg_hba.conf;
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
                exec = "cd sanitas_frontend/ && yarn && yarn dev";
              };
              storybook = {
                exec = "cd sanitas_frontend/ && yarn && yarn storybook";
              };
              backend.exec = let
                ipCommand =
                  if builtins.elem system ["x86_64-darwin" "aarch64-darwin"]
                  then "ifconfig en0 | grep 'inet ' | awk '{print $2}'"
                  else "ip route get 1.2.3.4 | awk '{print $7}'";
              in "cd sanitas_backend/ && sam build && sam local start-api --debug --add-host=hostpc:$(${ipCommand})";
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
              };
            };
          }
        ];
      };
    });
  };
}
