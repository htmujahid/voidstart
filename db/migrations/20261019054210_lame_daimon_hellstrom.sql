ALTER TABLE `session` ADD `impersonatedBy` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text;--> statement-breakpoint
ALTER TABLE `user` ADD `banned` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `banReason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `banExpires` integer;--> statement-breakpoint
UPDATE `user` SET `role` = 'user' WHERE `role` IS NULL;--> statement-breakpoint
UPDATE `user` SET `banned` = 0 WHERE `banned` IS NULL;
