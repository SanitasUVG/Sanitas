let
  rust_overlay = import (builtins.fetchTarball "https://github.com/oxalica/rust-overlay/archive/master.tar.gz");
  nixpkgs = import <nixpkgs> { overlays = [ rust_overlay ]; };
in
  with nixpkgs;
  stdenv.mkDerivation {
    name = "rust_overlay_shell";
    buildInputs = [
      # to use the latest nightly:
      (rust-bin.fromRustupToolchainFile ./rust-toolchain)
      # to use a specific nighly:
      # (nixpkgs.rustChannelOf { date = "2022-03-29"; channel = "stable"; }).rust
      # to use the project's rust-toolchain file:
      # (nixpkgs.rustChannelOf { rustToolchain = ./rust-toolchain; }).rust
      openssl
      pkg-config
      nodejs_20
      yarn
      wasm-pack
	  websocat
    ];
    shellHook = ''
      export RUST_BACKTRACE=1
      '';
  }
