use wasm_bindgen::prelude::*;
use web_sys::{console, HtmlElement, HtmlInputElement, HtmlButtonElement};
use rand::Rng;

#[wasm_bindgen]
pub struct Game {
    multiplier: f64,
    is_running: bool,
    crash_point: f64,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Game {
        Game {
            multiplier: 1.0,
            is_running: false,
            crash_point: 0.0,
        }
    }

    pub fn start_game(&mut self) -> f64 {
        if self.is_running {
            return self.multiplier;
        }

        self.is_running = true;
        self.multiplier = 1.0;
        
        // Generate crash point using a house edge of 5%
        let mut rng = rand::thread_rng();
        let random = rng.gen::<f64>();
        self.crash_point = 0.99 / (1.0 - random);
        
        self.multiplier
    }

    pub fn update_multiplier(&mut self) -> f64 {
        if !self.is_running {
            return self.multiplier;
        }

        self.multiplier += 0.01;
        
        if self.multiplier >= self.crash_point {
            self.is_running = false;
            self.multiplier = self.crash_point; // Set to crash point instead of 1.0
        }

        self.multiplier
    }

    pub fn cash_out(&mut self, bet: f64) -> f64 {
        if !self.is_running {
            return 0.0;
        }

        let winnings = bet * self.multiplier;
        self.is_running = false;
        self.multiplier = 1.0;
        
        winnings
    }

    pub fn get_multiplier(&self) -> f64 {
        self.multiplier
    }

    pub fn is_running(&self) -> bool {
        self.is_running
    }
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
} 