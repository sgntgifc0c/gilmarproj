-- create_users_db.sql
-- Cria o banco de dados e tabelas principais para usuários e cupons

CREATE DATABASE IF NOT EXISTS `sorteios` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sorteios`;

-- Tabela principal de usuários
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(200) NOT NULL,
  `documento` VARCHAR(14) NOT NULL,
  `documento_tipo` ENUM('CPF','CNPJ') NOT NULL,
  `telefone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `cep` VARCHAR(10) DEFAULT NULL,
  `numero_endereco` VARCHAR(20) DEFAULT NULL,
  `senha_hash` VARCHAR(255) DEFAULT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_documento` (`documento`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- TABELA DE CHATS (INTEGRAÇÃO COM GEMINI)
-- ==========================================================
CREATE TABLE IF NOT EXISTS `user_chats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `titulo` VARCHAR(150) DEFAULT NULL,
  `modelo` VARCHAR(100) DEFAULT 'gemini-1.5-pro',
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_chat` (`user_id`),
  CONSTRAINT `fk_user_chat_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- TABELA DE MENSAGENS DE CHAT
-- ==========================================================
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `chat_id` BIGINT UNSIGNED NOT NULL,
  `autor` ENUM('user', 'assistant') NOT NULL,
  `mensagem` TEXT NOT NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_chat` (`chat_id`),
  CONSTRAINT `fk_chat_message_chat`
    FOREIGN KEY (`chat_id`) REFERENCES `user_chats`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- USUÁRIO ADMINISTRADOR PADRÃO (opcional)
-- ==========================================================



-- Executar uma única vez:
INSERT INTO users (nome, documento, documento_tipo, email, is_admin)
VALUES ('Yuri (modelo)', '00000000000', 'CPF', 'yuri@system.local', 0);

INSERT INTO user_chats (user_id, titulo)
VALUES ((SELECT id FROM users WHERE email = 'yuri@system.local'), 'Chat Modelo - Gemini');
