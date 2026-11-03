-- ========================================================
-- MARK LVI - BANCO DE DADOS MYSQL: emribeir_jarvismulti
-- Usuário: emribeir_romildo
-- ========================================================

CREATE DATABASE IF NOT EXISTS `emribeir_jarvismulti` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `emribeir_jarvismulti`;

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL,
  `papel` ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
  `status` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE DEFINIÇÃO DE VOZES (Fish Audio e Locais)
CREATE TABLE IF NOT EXISTS `vozes_sistema` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `voice_id` VARCHAR(150) NOT NULL,
  `provedor` VARCHAR(50) NOT NULL DEFAULT 'fishaudio',
  `modelo` VARCHAR(50) NOT NULL DEFAULT 's2.1-pro-free',
  `idioma` VARCHAR(20) NOT NULL DEFAULT 'pt-BR',
  `padrao` TINYINT(1) NOT NULL DEFAULT 0,
  `descricao` TEXT NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. INSERÇÃO DO ADMINISTRADOR INICIAL PADRÃO
-- Senha padrão inicial: Romildo2009@ (hash SHA-256)
INSERT INTO `usuarios` (`nome`, `email`, `senha_hash`, `papel`, `status`)
VALUES 
('Romildo Coelho', 'romildocoelhooficial@gmail.com', SHA2('Romildo2009@', 256), 'admin', 'ativo'),
('Administrador JARVIS', 'admin@jarvis.ai', SHA2('admin123', 256), 'admin', 'ativo')
ON DUPLICATE KEY UPDATE `papel` = VALUES(`papel`), `status` = 'ativo';

-- 4. INSERÇÃO DA VOZ PADRÃO FISH AUDIO SOLICITADA
INSERT INTO `vozes_sistema` (`nome`, `voice_id`, `provedor`, `modelo`, `idioma`, `padrao`, `descricao`)
VALUES 
('JARVIS Oficial PT-BR', '82d13948027e4be69892dd3d0104e681', 'fishaudio', 's2.1-pro-free', 'pt-BR', 1, 'Voz neural Fish Audio padrão do sistema Mark LVI'),
('JARVIS Tático Alternativo', '3b18544a0eef4d40b9d7ef3ef30b8d5a', 'fishaudio', 's2.1-pro-free', 'pt-BR', 0, 'Voz operacional tática secundária')
ON DUPLICATE KEY UPDATE `padrao` = VALUES(`padrao`);
