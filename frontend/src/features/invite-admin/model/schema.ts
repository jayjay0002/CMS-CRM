import { z } from 'zod'

import { ADMIN_EMAIL_MAX_LENGTH, ADMIN_NAME_MAX_LENGTH, ADMIN_ROLES } from '@/entities/admin'
import { requiredText, tooLongMessage } from '@/shared/lib'

export const inviteAdminSchema = z.object({
  email: z
    .email('Enter an email like name@example.com')
    .max(ADMIN_EMAIL_MAX_LENGTH, tooLongMessage(ADMIN_EMAIL_MAX_LENGTH)),
  fullName: requiredText(ADMIN_NAME_MAX_LENGTH, 'Enter their name'),
  role: z.enum([ADMIN_ROLES.owner, ADMIN_ROLES.staff]),
})

export type InviteAdminValues = z.infer<typeof inviteAdminSchema>
