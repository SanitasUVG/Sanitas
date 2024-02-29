{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    rust-overlay,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        dbPort = "5433";
        overlays = [(import rust-overlay)];
        pkgs = import nixpkgs {inherit system overlays;};
        rustVersion = pkgs.rust-bin.stable.latest.default;

        rustPlatform = pkgs.makeRustPlatform {
          cargo = rustVersion;
          rustc = rustVersion;
        };

        myRustPackage = rustPlatform.buildRustPackage {
          pname = "sanitas_backend";
          version = "0.1.0";
          src = ./backend;
          cargoLock.lockFile = ./backend/Cargo.lock;
        };

				dockerImage = pkgs.dockerTools.buildImage {
					name = "sanitas_backend_img";
					config = {
						Cmd = [
							"${myRustPackage}/bin/sanitas_backend"
						];
					};
				};
      in {
        packages = {
          rustPackage = myRustPackage;
					docker = dockerImage;
        };
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # Utilities
            rm-improved

            # Database
            postgresql
            sqlfluff # SQL linter and formatter

            # Backend
						(rust-bin.stable.latest.default)

            # Frontend
            nodejs_20
            yarn
          ];
          shellHook = ''
            # General utilities
            alias rm="rip"

            # Start the service
            alias dbStart="pg_ctl -D .tmp/data -l dbLogfile -o \"--unix-socket-directories='$PWD' --port=${dbPort} \" start"
            # Stop the service
            alias dbStop="pg_ctl -D .tmp/data stop"
            # Remove everything related to the DB
            alias dbUnsetup="dbStop; rm .tmp/ dbLogfile"
            # Setup the postgres DB and start it
            alias dbSetup="initdb -D .tmp/data \
            	&& dbStart \
            	&& createdb -h 127.0.0.1 -p ${dbPort} mydb"
          '';
        };
      }
    );
}
