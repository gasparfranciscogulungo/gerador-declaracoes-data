/**
 * Sistema de Notificações para Usuários Pendentes
 * Gerencia badges, pop-ups e banners de forma profissional
 */

class NotificationSystem {
    constructor() {
        this.pendingCount = 0;
        this.lastChecked = localStorage.getItem('notif_last_checked') || null;
        this.hasNewPending = false;
    }

    /**
     * Inicializa o sistema de notificações
     */
    async init() {
        await this.checkPendingUsers();
        this.updateBadge();
        this.checkForNewPending();
        
        // Auto-atualiza a cada 30 segundos (se página estiver ativa)
        setInterval(() => {
            if (!document.hidden) {
                this.checkPendingUsers();
            }
        }, 30000);
    }

    /**
     * Verifica quantidade de usuários pendentes
     */
    async checkPendingUsers() {
        try {
            const userManager = new UserManager();
            const pendentes = await userManager.obterPendentes();
            
            const oldCount = this.pendingCount;
            this.pendingCount = pendentes.length;
            
            // Se aumentou o número de pendentes, marca como "novo"
            if (this.pendingCount > oldCount && oldCount > 0) {
                this.hasNewPending = true;
            }
            
            this.updateBadge();
            
            return pendentes;
        } catch (error) {
            console.error('❌ Erro ao verificar pendentes:', error);
            return [];
        }
    }

    /**
     * Atualiza o badge no menu
     */
    updateBadge() {
        const badgeElement = document.getElementById('users-badge');
        const iconElement = document.getElementById('users-notification-icon');
        
        if (badgeElement) {
            if (this.pendingCount > 0) {
                badgeElement.textContent = this.pendingCount;
                badgeElement.classList.remove('hidden');
            } else {
                badgeElement.classList.add('hidden');
            }
        }

        // Atualiza ícone de notificação (animação pulsar)
        if (iconElement) {
            if (this.hasNewPending && this.pendingCount > 0) {
                iconElement.classList.remove('hidden');
                iconElement.classList.add('animate-pulse');
            } else {
                iconElement.classList.add('hidden');
            }
        }
    }

    /**
     * Verifica se há novos pendentes desde a última visualização
     */
    checkForNewPending() {
        const now = new Date().toISOString();
        
        if (!this.lastChecked && this.pendingCount > 0) {
            // Primeira vez = mostra pop-up
            this.hasNewPending = true;
        }
    }

    /**
     * Marca notificações como visualizadas
     */
    markAsViewed() {
        const now = new Date().toISOString();
        localStorage.setItem('notif_last_checked', now);
        this.lastChecked = now;
        this.hasNewPending = false;
        this.updateBadge();
    }

    /**
     * Mostra pop-up de notificação (ao entrar no admin)
     */
    async showPopupIfNeeded() {
        if (this.pendingCount === 0) return;

        // Verifica se deve mostrar pop-up
        const lastPopup = localStorage.getItem('notif_last_popup');
        const now = Date.now();
        
        // Só mostra pop-up se:
        // 1. Nunca mostrou antes, OU
        // 2. Passou mais de 5 minutos desde o último pop-up E há novos pendentes
        if (!lastPopup || (now - parseInt(lastPopup) > 5 * 60 * 1000 && this.hasNewPending)) {
            this.displayPopup();
            localStorage.setItem('notif_last_popup', now.toString());
        }
    }

    /**
     * Exibe o pop-up na tela
     */
    displayPopup() {
        // Remove pop-up anterior se existir
        const oldPopup = document.getElementById('pending-notification-popup');
        if (oldPopup) oldPopup.remove();

        const popup = document.createElement('div');
        popup.id = 'pending-notification-popup';
        popup.className = 'fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 p-6 max-w-md transform transition-all duration-500 ease-out';
        popup.style.animation = 'slideInRight 0.5s ease-out';
        
        popup.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <i class="bi bi-person-exclamation text-2xl text-orange-600"></i>
                    </div>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-lg font-bold text-gray-900">
                        ${this.pendingCount === 1 ? 'Novo usuário pendente!' : `${this.pendingCount} usuários pendentes!`}
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                        ${this.pendingCount === 1 
                            ? 'Há 1 usuário aguardando aprovação.'
                            : `Há ${this.pendingCount} usuários aguardando aprovação.`
                        }
                    </p>
                    <div class="mt-4 flex space-x-3">
                        <button onclick="notificationSystem.viewPendingUsers()" 
                                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="bi bi-eye mr-1"></i> Ver Agora
                        </button>
                        <button onclick="notificationSystem.closePopup()" 
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Depois
                        </button>
                    </div>
                </div>
                <button onclick="notificationSystem.closePopup()" 
                        class="ml-4 text-gray-400 hover:text-gray-600">
                    <i class="bi bi-x-lg text-xl"></i>
                </button>
            </div>
        `;

        document.body.appendChild(popup);

        // Auto-fecha após 10 segundos
        setTimeout(() => {
            this.closePopup();
        }, 10000);
    }

    /**
     * Fecha o pop-up
     */
    closePopup() {
        const popup = document.getElementById('pending-notification-popup');
        if (popup) {
            popup.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => popup.remove(), 300);
        }
    }

    /**
     * Redireciona para painel de usuários
     */
    viewPendingUsers() {
        this.closePopup();
        this.markAsViewed();
        window.location.href = 'users.html?tab=pending';
    }

    /**
     * Mostra banner informativo (menos intrusivo que pop-up)
     */
    showBanner() {
        if (this.pendingCount === 0) return;

        const existingBanner = document.getElementById('pending-banner');
        if (existingBanner) return; // Já existe

        const banner = document.createElement('div');
        banner.id = 'pending-banner';
        banner.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg z-40 transform transition-transform duration-300';
        
        banner.innerHTML = `
            <div class="container mx-auto flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="bi bi-info-circle text-2xl"></i>
                    <p class="font-medium">
                        ${this.pendingCount === 1 
                            ? '1 usuário aguardando aprovação'
                            : `${this.pendingCount} usuários aguardando aprovação`
                        }
                    </p>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="notificationSystem.viewPendingUsers()" 
                            class="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-colors">
                        Ver Pendentes
                    </button>
                    <button onclick="notificationSystem.closeBanner()" 
                            class="text-white hover:text-orange-100 p-2">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Auto-fecha após 15 segundos
        setTimeout(() => {
            this.closeBanner();
        }, 15000);
    }

    /**
     * Fecha o banner
     */
    closeBanner() {
        const banner = document.getElementById('pending-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }

    /**
     * Estratégia de notificação em camadas (timing diferente)
     */
    async notifyWithLayers() {
        // Primeiro: atualiza badge (imediato)
        await this.checkPendingUsers();
        
        if (this.pendingCount === 0) return;

        // Segundo: pop-up após 2 segundos (mais visível)
        setTimeout(() => {
            this.showPopupIfNeeded();
        }, 2000);

        // Terceiro: banner após 20 segundos (se ainda não visualizou)
        setTimeout(() => {
            if (this.pendingCount > 0 && !localStorage.getItem('notif_last_checked')) {
                this.showBanner();
            }
        }, 20000);
    }
}

// Animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(style);

// Instância global
const notificationSystem = new NotificationSystem();

/**
 * Sistema de Prompt Profissional (substitui prompt() nativo)
 * Retorna uma Promise que resolve com o valor digitado ou null se cancelado
 */
window.showPrompt = function(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Entrada de dados',
            placeholder = '',
            defaultValue = '',
            confirmText = 'OK',
            cancelText = 'Cancelar',
            type = 'text', // text, password, url, etc
            icon = 'bi-pencil-square'
        } = options;

        // Remove modal anterior se existir
        const oldModal = document.getElementById('custom-prompt-modal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.id = 'custom-prompt-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm';
        modal.style.animation = 'fadeIn 0.2s ease-out';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all" 
                 style="animation: scaleIn 0.2s ease-out;">
                <div class="p-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="bi ${icon} text-2xl text-blue-600"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-lg font-bold text-gray-900 mb-2">
                                ${title}
                            </h3>
                            <p class="text-sm text-gray-600 mb-4 whitespace-pre-line">
                                ${message}
                            </p>
                            <input type="${type}" 
                                   id="prompt-input" 
                                   value="${defaultValue}"
                                   placeholder="${placeholder}"
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                    <button id="prompt-cancel-btn" 
                            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
                        ${cancelText}
                    </button>
                    <button id="prompt-ok-btn" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const inputElement = document.getElementById('prompt-input');
        inputElement.focus();
        inputElement.select();

        const closeModal = (result) => {
            modal.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => {
                modal.remove();
                resolve(result);
            }, 200);
        };

        // Event listeners
        document.getElementById('prompt-ok-btn').addEventListener('click', () => {
            closeModal(inputElement.value);
        });
        
        document.getElementById('prompt-cancel-btn').addEventListener('click', () => {
            closeModal(null);
        });
        
        // Enter para confirmar
        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                closeModal(inputElement.value);
            } else if (e.key === 'Escape') {
                closeModal(null);
            }
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(null);
        });
    });
};

/**
 * Sistema de Confirmação Profissional (substitui confirm() nativo)
 * Retorna uma Promise que resolve true/false
 */
window.showConfirm = function(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Confirmação',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning', // warning, danger, info
            icon = 'bi-question-circle'
        } = options;

        // Remove modal anterior se existir
        const oldModal = document.getElementById('custom-confirm-modal');
        if (oldModal) oldModal.remove();

        // Cores baseadas no tipo
        const colors = {
            warning: { bg: 'bg-orange-100', icon: 'text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700' },
            danger: { bg: 'bg-red-100', icon: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
            info: { bg: 'bg-blue-100', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' }
        };
        const color = colors[type] || colors.warning;

        const modal = document.createElement('div');
        modal.id = 'custom-confirm-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm';
        modal.style.animation = 'fadeIn 0.2s ease-out';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all" 
                 style="animation: scaleIn 0.2s ease-out;">
                <div class="p-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 ${color.bg} rounded-full flex items-center justify-center">
                                <i class="bi ${icon} text-2xl ${color.icon}"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-lg font-bold text-gray-900 mb-2">
                                ${title}
                            </h3>
                            <p class="text-sm text-gray-600 whitespace-pre-line">
                                ${message}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                    <button id="confirm-cancel-btn" 
                            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
                        ${cancelText}
                    </button>
                    <button id="confirm-ok-btn" 
                            class="px-4 py-2 ${color.btn} text-white rounded-lg font-medium transition-colors">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = (result) => {
            modal.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => {
                modal.remove();
                resolve(result);
            }, 200);
        };

        // Event listeners
        document.getElementById('confirm-ok-btn').addEventListener('click', () => closeModal(true));
        document.getElementById('confirm-cancel-btn').addEventListener('click', () => closeModal(false));
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(false);
        });

        // ESC para cancelar
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
};
