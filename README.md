# Aviator WebAssembly Game

A modern implementation of the Aviator crash game using WebAssembly and Rust.

## Project Structure

- `src/` - Source code directory
  - `rust/` - Rust code for WebAssembly
  - `web/` - Web interface code
- `pkg/` - Compiled WebAssembly files
- `index.html` - Main HTML file

## Prerequisites

- Rust and Cargo
- wasm-pack
- Node.js and npm (for development server)

## Setup

1. Install Rust and wasm-pack:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   wasm-pack build --target web
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Game Rules

1. Place your bet
2. Watch the multiplier increase
3. Cash out before the game crashes
4. Win your bet multiplied by the cash-out multiplier

## License

MIT 