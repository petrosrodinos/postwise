export const ApiRoutes = {
    health: {
        prefix: "/health",
    },
    auth: {
        email: {
            login: "/auth/email/login",
            register: "/auth/email/register",
            refresh_token: "/auth/email/refresh-token",
            admin_login_to_account: (account_uuid: string) => `/auth/email/${account_uuid}/admin-login`,
            forgot_password: "/auth/forgot-password",
            reset_password: "/auth/reset-password",
            verify_email: "/auth/verify-email",
            resend_verification_email: "/auth/resend-verification-email",
        },
    },
    users: {
        prefix: "/users",
        me: "/users/me",
        me_password: "/users/me/password",
    },
    google_maps: {
        timezone: "/google-maps/timezone",
    },
    organisations: {
        prefix: "/organisations",
        members: (organisation_id: string) => `/organisations/${organisation_id}/members`,
        member: (organisation_id: string, member_id: string) => `/organisations/${organisation_id}/members/${member_id}`,
        resend_invitation: (organisation_id: string, member_id: string) =>
            `/organisations/${organisation_id}/members/${member_id}/resend-invitation`,
    },
    organisation_invitations: {
        prefix: "/organisation-invitations",
        accept: "/organisation-invitations/accept",
    },
    projects: {
        prefix: "/projects",
        generate_details: "/projects/generate-details",
        style_profiles: (project_id: string) => `/projects/${project_id}/style-profiles`,
        style_profile: (project_id: string, style_profile_id: string) => `/projects/${project_id}/style-profiles/${style_profile_id}`,
        rss_feeds: (project_id: string) => `/projects/${project_id}/rss-feeds`,
        rss_feed: (project_id: string, rss_feed_id: string) => `/projects/${project_id}/rss-feeds/${rss_feed_id}`,
    },
    style_profiles: {
        prefix: "/style-profiles",
        analyze: (id: string) => `/style-profiles/${id}/analyze`,
        scrape_posts: (id: string) => `/style-profiles/${id}/scrape-posts`,
    },
    rss_feeds: {
        prefix: "/rss-feeds",
        fetch_items: (id: string) => `/rss-feeds/${id}/fetch-items`,
        items: (id: string) => `/rss-feeds/${id}/items`,
    },
    posts: {
        prefix: "/posts",
        schedule: (id: string) => `/posts/${id}/schedule`,
        publish: (id: string) => `/posts/${id}/publish`,
        repurpose: (id: string) => `/posts/${id}/repurpose`,
        attachments: (id: string) => `/posts/${id}/attachments`,
        attachment: (id: string, attachment_id: string) => `/posts/${id}/attachments/${attachment_id}`,
        channels: (id: string) => `/posts/${id}/channels`,
        channel: (id: string, channel_id: string) => `/posts/${id}/channels/${channel_id}`,
    },
    generation_runs: {
        prefix: "/generation-runs",
        from_rss: "/generation-runs/from-rss",
    },
    automations: {
        prefix: "/automations",
    },
    documents: {
        prefix: "/documents",
    },
    social_channel_connections: {
        prefix: "/social-channel-connections",
    },
}
