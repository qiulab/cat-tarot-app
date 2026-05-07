ALTER TABLE `readings` MODIFY COLUMN `sessionId` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `readings` ADD `readerCharacterId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `readings` DROP COLUMN `spreadName`;