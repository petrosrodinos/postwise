-- AlterTable: Project.channels widens from SocialChannel[] (LINKEDIN/TWITTER
-- only) to PostType[] (LINKEDIN/TWITTER/BLOG) so a project can target Blog
-- alongside social channels in the same generation batch. SocialChannel's
-- members are string-identical to their PostType counterparts, so this is a
-- safe two-step cast; existing rows carry their values over unchanged.
ALTER TABLE "projects"
  ALTER COLUMN "channels" TYPE "PostType"[] USING "channels"::text[]::"PostType"[];
