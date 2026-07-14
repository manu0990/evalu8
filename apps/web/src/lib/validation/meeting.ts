import * as z from 'zod';

const resumeMetaSchema = z.object({
  name: z.string(),
  key: z.string(),
  size: z.number(),
});

export const newMeetingFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.url().optional().or(z.literal('')),
  roleToApply: z.string().min(1, 'Role to apply is required'),
  requirements: z.string().min(1, 'Job requirements are required'),
  resume: resumeMetaSchema,
});


export type newMeetingFormTypes = z.infer<typeof newMeetingFormSchema>;