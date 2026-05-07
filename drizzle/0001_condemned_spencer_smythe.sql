CREATE TABLE `readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`spreadType` varchar(32) NOT NULL,
	`spreadName` varchar(64) NOT NULL,
	`question` text,
	`cards` json NOT NULL,
	`interpretation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readings_id` PRIMARY KEY(`id`)
);
