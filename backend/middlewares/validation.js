import { z } from 'zod';

export const validateSchema = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate req.body, req.query, or req.params depending on schema setup
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign cleaned, parsed values back
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            path: e.path.join('.').replace(/^(body|query|params)\./, ''),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal Validation Error',
      });
    }
  };
};

// Define some standard schemas we can reuse
export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const addDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    speciality: z.string().min(1, 'Speciality is required'),
    degree: z.string().min(1, 'Degree is required'),
    experience: z.string().min(1, 'Experience is required'),
    about: z.string().min(10, 'About must be at least 10 characters'),
    fees: z.string().or(z.number()),
    address: z.string(), // Will be parsed inside controller, but let's validate it is present
  }),
});

export const bookAppointmentSchema = z.object({
  body: z.object({
    docId: z.string().min(1, 'Doctor ID is required'),
    slotDate: z.string().min(1, 'Slot date is required'),
    slotTime: z.string().min(1, 'Slot time is required'),
    userId: z.string(), // Added by authUser middleware, but validated here
  }),
});

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
    newSlotDate: z.string().min(1, 'New Slot Date is required'),
    newSlotTime: z.string().min(1, 'New Slot Time is required'),
    userId: z.string(),
  }),
});

export const rateDoctorSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
    rating: z.number().min(1).max(5),
    review: z.string().optional(),
    userId: z.string(),
  }),
});

