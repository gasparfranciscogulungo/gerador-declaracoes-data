// ============================================
// DARK-MODE.JS
// Sistema de tema escuro persistente
// ============================================

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'dark_mode_enabled';
        this.isDark = false;
        this.init();
    }

    init() {
        // Carregar preferência salva
        const saved = localStorage.getItem(this.STORAGE_KEY);
        
        if (saved !== null) {
            this.isDark = saved === 'true';
        } else {
            // Detectar preferência do sistema
            this.isDark = window.matchMedia && 
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // Aplicar tema
        this.apply();

        // Criar botão toggle
        this.createToggleButton();

        console.log(`🌙 Dark Mode: ${this.isDark ? 'ON' : 'OFF'}`);
    }

    apply() {
        if (this.isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggle() {
        this.isDark = !this.isDark;
        this.apply();
        this.save();
        
        // Animação suave
        document.body.style.transition = 'all 0.3s ease';
        
        console.log(`🌙 Dark Mode: ${this.isDark ? 'ON' : 'OFF'}`);
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, this.isDark.toString());
    }

    createToggleButton() {
        // Verificar se já existe
        if (document.getElementById('dark-mode-toggle')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'dark-mode-toggle';
        button.className = 'dark-mode-toggle';
        button.title = 'Alternar tema';
        button.innerHTML = this.isDark ? '☀️' : '🌙';
        
        button.addEventListener('click', () => {
            this.toggle();
            button.innerHTML = this.isDark ? '☀️' : '🌙';
        });

        document.body.appendChild(button);
    }

    enable() {
        this.isDark = true;
        this.apply();
        this.save();
    }

    disable() {
        this.isDark = false;
        this.apply();
        this.save();
    }

    isEnabled() {
        return this.isDark;
    }
}

// Instância global
const darkMode = new DarkModeManager();

// Expor funções globais
window.toggleDarkMode = () => darkMode.toggle();
window.enableDarkMode = () => darkMode.enable();
window.disableDarkMode = () => darkMode.disable();
