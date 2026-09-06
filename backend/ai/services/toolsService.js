import doctorModel from '../../models/doctorModel.js';
import appointmentModel from '../../models/appointmentModel.js';
import userModel from '../../models/userModel.js';
import { emitToDoctor, emitToAdmin, emitToUser } from '../../config/socket.js';

// Standard clinic appointment time slots
const STANDARD_TIME_SLOTS = [
  "10:00 am", "10:30 am", "11:00 am", "11:30 am",
  "12:00 pm", "02:00 pm", "02:30 pm", "03:00 pm",
  "03:30 pm", "04:00 pm", "04:30 pm", "05:00 pm",
  "06:00 pm", "07:00 pm", "08:00 pm"
];

/**
 * Format date to standard DD_MM_YYYY used across HealthVerse
 */
export const formatSlotDate = (dateInput) => {
  const now = new Date();
  let targetDate = new Date();

  if (typeof dateInput === 'string') {
    const lower = dateInput.toLowerCase().trim();
    if (lower === 'today') {
      targetDate = now;
    } else if (lower === 'tomorrow') {
      targetDate = new Date(now.setDate(now.getDate() + 1));
    } else if (dateInput.includes('_')) {
      return dateInput; // Already in DD_MM_YYYY
    } else if (dateInput.includes('-')) {
      const parts = dateInput.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD_MM_YYYY
        return `${parseInt(parts[2], 10)}_${parseInt(parts[1], 10)}_${parts[0]}`;
      }
    } else {
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }
  }

  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  const year = targetDate.getFullYear();
  return `${day}_${month}_${year}`;
};

/**
 * Tool Specifications (OpenAI / Grok Function Calling JSON Schema)
 */
export const AI_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "searchDoctors",
      description: "Search and filter registered HealthVerse doctors by medical speciality, doctor name, symptoms, or minimum rating.",
      parameters: {
        type: "object",
        properties: {
          speciality: {
            type: "string",
            description: "Medical speciality, e.g. 'General physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Gastroenterologist', 'Gynecologist', 'Ophthalmologist'"
          },
          query: {
            type: "string",
            description: "Keyword search for doctor name, symptoms, or conditions"
          },
          minRating: {
            type: "number",
            description: "Minimum star rating (1 to 5)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getDoctorDetails",
      description: "Get comprehensive profile, fees, bio, ratings, address, and experience of a specific doctor.",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "The MongoDB ID (_id) of the doctor"
          },
          doctorName: {
            type: "string",
            description: "The name of the doctor (e.g. 'Dr. Richard James')"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getAvailableSlots",
      description: "Retrieve open and available appointment time slots for a specific doctor on a given date.",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "The ID of the doctor"
          },
          slotDate: {
            type: "string",
            description: "Date for appointment, e.g. 'today', 'tomorrow', 'DD_MM_YYYY' (e.g. '5_9_2026') or 'YYYY-MM-DD'"
          }
        },
        required: ["doctorId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getUserAppointments",
      description: "Retrieve current user's booked upcoming and past consultations and their status.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filter by status: 'Pending', 'Approved', 'Completed', 'Cancelled', or 'all'"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "prepareAppointmentBooking",
      description: "Prepare an appointment booking preview for user confirmation. Does NOT charge or book until user explicitly confirms.",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "The ID of the doctor to book with"
          },
          slotDate: {
            type: "string",
            description: "Target appointment date, e.g. 'today', 'tomorrow', or 'DD_MM_YYYY'"
          },
          slotTime: {
            type: "string",
            description: "Time slot, e.g. '10:00 am', '02:30 pm'"
          }
        },
        required: ["doctorId", "slotDate", "slotTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "confirmAppointmentBooking",
      description: "Finalize and book an appointment after the user has given explicit consent/confirmation.",
      parameters: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            description: "The ID of the doctor"
          },
          slotDate: {
            type: "string",
            description: "Date string in DD_MM_YYYY format"
          },
          slotTime: {
            type: "string",
            description: "Time string (e.g. '10:00 am')"
          },
          userConfirmed: {
            type: "boolean",
            description: "Must be true indicating explicit user agreement to book"
          }
        },
        required: ["doctorId", "slotDate", "slotTime", "userConfirmed"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancelUserAppointment",
      description: "Cancel a previously booked appointment upon explicit user confirmation.",
      parameters: {
        type: "object",
        properties: {
          appointmentId: {
            type: "string",
            description: "The ID of the appointment to cancel"
          },
          userConfirmed: {
            type: "boolean",
            description: "Must be true indicating explicit user agreement to cancel"
          }
        },
        required: ["appointmentId", "userConfirmed"]
      }
    }
  }
];

/**
 * Tool Execution Handlers
 */
export const executeTool = async (name, args, context = {}) => {
  const { userId } = context;

  console.log(`[AITool] Executing tool "${name}" with args:`, JSON.stringify(args));

  try {
    switch (name) {
      case "searchDoctors": {
        const filter = { available: true };
        if (args.speciality && args.speciality.trim() !== '') {
          filter.speciality = { $regex: new RegExp(args.speciality.trim(), 'i') };
        }
        if (args.minRating) {
          filter.averageRating = { $gte: Number(args.minRating) };
        }

        let doctors = await doctorModel.find(filter).select("-password -email").limit(6);

        if (args.query && doctors.length === 0) {
          const regex = new RegExp(args.query.trim(), 'i');
          doctors = await doctorModel.find({
            available: true,
            $or: [{ name: regex }, { speciality: regex }, { about: regex }]
          }).select("-password -email").limit(6);
        }

        // If specific filtered search has 0 doctors, fallback to all available doctors in system
        if (doctors.length === 0) {
          doctors = await doctorModel.find({ available: true }).select("-password -email").limit(6);
        }

        return {
          count: doctors.length,
          doctors: doctors.map(d => ({
            _id: d._id,
            name: d.name,
            speciality: d.speciality,
            degree: d.degree,
            experience: d.experience,
            fees: d.fees,
            image: d.image,
            rating: d.averageRating || 5.0,
            about: d.about,
          }))
        };
      }

      case "getDoctorDetails": {
        let doctor = null;
        if (args.doctorId) {
          doctor = await doctorModel.findById(args.doctorId).select("-password -email");
        } else if (args.doctorName) {
          doctor = await doctorModel.findOne({
            name: { $regex: new RegExp(args.doctorName.trim(), 'i') }
          }).select("-password -email");
        }

        if (!doctor) {
          return { error: "Doctor not found matching the criteria." };
        }

        return {
          _id: doctor._id,
          name: doctor.name,
          speciality: doctor.speciality,
          degree: doctor.degree,
          experience: doctor.experience,
          fees: doctor.fees,
          image: doctor.image,
          about: doctor.about,
          available: doctor.available,
          address: doctor.address,
          averageRating: doctor.averageRating || 5.0,
        };
      }

      case "getAvailableSlots": {
        const docId = args.doctorId;
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
          return { error: "Doctor not found." };
        }

        const slotDate = formatSlotDate(args.slotDate || 'today');
        const booked = (doctor.slots_booked && doctor.slots_booked[slotDate]) || [];
        const availableSlots = STANDARD_TIME_SLOTS.filter(slot => !booked.includes(slot));

        return {
          doctorId: doctor._id,
          doctorName: doctor.name,
          speciality: doctor.speciality,
          fees: doctor.fees,
          date: slotDate,
          totalSlots: STANDARD_TIME_SLOTS.length,
          availableSlotsCount: availableSlots.length,
          availableSlots: availableSlots,
          isDoctorAvailable: doctor.available,
        };
      }

      case "getUserAppointments": {
        if (!userId) {
          return {
            requiresLogin: true,
            message: "User must be logged in to view their booked appointments."
          };
        }

        const filter = { userId };
        if (args.status && args.status.toLowerCase() !== 'all') {
          filter.status = new RegExp(args.status, 'i');
        }

        const appointments = await appointmentModel.find(filter).sort({ date: -1 }).limit(10);

        return {
          count: appointments.length,
          appointments: appointments.map(a => ({
            _id: a._id,
            doctorName: a.docData?.name || "Doctor",
            speciality: a.docData?.speciality || "General",
            slotDate: a.slotDate,
            slotTime: a.slotTime,
            amount: a.amount,
            status: a.status,
            cancelled: a.cancelled,
            isCompleted: a.isCompleted,
            videoLink: a.videoLink,
          }))
        };
      }

      case "prepareAppointmentBooking": {
        const { doctorId, slotDate: rawDate, slotTime } = args;
        const slotDate = formatSlotDate(rawDate);

        const doctor = await doctorModel.findById(doctorId).select("-password");
        if (!doctor) return { error: "Doctor not found." };
        if (!doctor.available) return { error: "Doctor is currently not available for bookings." };

        const booked = (doctor.slots_booked && doctor.slots_booked[slotDate]) || [];
        if (booked.includes(slotTime)) {
          return { error: `Slot ${slotTime} on ${slotDate} is already booked. Please choose another slot.` };
        }

        return {
          pendingConfirmation: true,
          doctorId: doctor._id,
          doctorName: doctor.name,
          speciality: doctor.speciality,
          fees: doctor.fees,
          slotDate,
          slotTime,
          message: `Ready to book appointment with ${doctor.name} on ${slotDate} at ${slotTime} for ₹${doctor.fees}. Please confirm to finalize.`
        };
      }

      case "confirmAppointmentBooking": {
        if (!args.userConfirmed) {
          return { error: "Booking aborted: Explicit user confirmation was not provided." };
        }

        if (!userId) {
          return {
            requiresLogin: true,
            message: "You must be logged in to complete your appointment booking."
          };
        }

        const { doctorId, slotTime } = args;
        const slotDate = formatSlotDate(args.slotDate);

        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) return { error: "Doctor not found." };
        if (!doctor.available) return { error: "Doctor is currently unavailable." };

        let slots_booked = doctor.slots_booked || {};
        if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
          return { error: `Slot ${slotTime} on ${slotDate} was just taken. Please select another slot.` };
        }

        // Add slot
        if (!slots_booked[slotDate]) {
          slots_booked[slotDate] = [];
        }
        slots_booked[slotDate].push(slotTime);

        // Fetch User Data
        const userData = await userModel.findById(userId).select("-password");
        if (!userData) return { error: "User account not found." };

        const docData = { ...doctor.toObject() };
        delete docData.slots_booked;
        delete docData.password;

        const newAppointment = new appointmentModel({
          userId,
          docId: doctorId,
          slotDate,
          slotTime,
          userData: {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            image: userData.image || '',
            dob: userData.dob || '',
            gender: userData.gender || '',
          },
          docData,
          amount: doctor.fees,
          date: Date.now(),
          status: 'Pending',
          timeline: [
            { status: 'Pending', label: 'Appointment booked via NovaCare AI Assistant', timestamp: Date.now() }
          ]
        });

        newAppointment.videoLink = `https://meet.jit.si/healthverse-appt-${newAppointment._id}`;
        await newAppointment.save();
        await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });

        // Real-time socket notifications
        try {
          emitToDoctor(doctorId, 'appointment_booked', { appointmentId: newAppointment._id, patientName: userData.name });
          emitToAdmin('appointment_booked', { appointmentId: newAppointment._id });
        } catch (sockErr) {
          console.warn('[Socket] Notification error:', sockErr.message);
        }

        return {
          success: true,
          appointmentId: newAppointment._id,
          doctorName: doctor.name,
          speciality: doctor.speciality,
          slotDate,
          slotTime,
          amount: doctor.fees,
          videoLink: newAppointment.videoLink,
          message: `Appointment successfully booked with ${doctor.name} for ${slotDate} at ${slotTime}!`
        };
      }

      case "cancelUserAppointment": {
        if (!args.userConfirmed) {
          return { error: "Cancellation aborted: Explicit user confirmation was not provided." };
        }

        if (!userId) {
          return { requiresLogin: true, message: "Login required to cancel appointments." };
        }

        const { appointmentId } = args;
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) return { error: "Appointment record not found." };

        if (appointment.userId.toString() !== userId.toString()) {
          return { error: "Unauthorized: You can only cancel your own appointments." };
        }

        if (appointment.cancelled) {
          return { message: "This appointment is already cancelled." };
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
          cancelled: true,
          status: 'Cancelled',
          $push: { timeline: { status: 'Cancelled', label: 'Cancelled via AI Assistant', timestamp: Date.now() } }
        });

        // Release slot
        const { docId, slotDate, slotTime } = appointment;
        const doctor = await doctorModel.findById(docId);
        if (doctor && doctor.slots_booked && doctor.slots_booked[slotDate]) {
          doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(s => s !== slotTime);
          await doctorModel.findByIdAndUpdate(docId, { slots_booked: doctor.slots_booked });
        }

        try {
          emitToDoctor(docId, 'appointment_cancelled', { appointmentId });
          emitToAdmin('appointment_cancelled', { appointmentId });
          emitToUser(userId, 'appointment_cancelled', { appointmentId });
        } catch (sErr) {}

        return {
          success: true,
          message: `Appointment on ${slotDate} at ${slotTime} has been successfully cancelled.`
        };
      }

      default:
        return { error: `Tool "${name}" is not implemented.` };
    }
  } catch (error) {
    console.error(`[AITool] Error executing ${name}:`, error);
    return { error: error.message };
  }
};
