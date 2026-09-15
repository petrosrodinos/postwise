import { EmailTemplates } from '@/integrations/notifications/resend/interfaces/mail.interfaces';

export const EmailConfig = {
    email_addresses: {
        verification: 'sentify@logiqdev.com',
        alert: 'sentify@logiqdev.com',
    },
    templates: {
        waitlist: {
            subject: 'Sentify - Waitlist',
            template_id: EmailTemplates.WAITLIST,
        },
        password_reset: {
            subject: 'Reset your password',
            template_id: EmailTemplates.PASSWORD_RESET,
        },
        organisation_invite: {
            subject: "You're invited to join a Postwise workspace",
            template_id: EmailTemplates.ORGANISATION_INVITE,
        },
        organisation_member_added: {
            subject: 'You now have access to a Postwise workspace',
            template_id: EmailTemplates.ORGANISATION_MEMBER_ADDED,
        },
    }
}
