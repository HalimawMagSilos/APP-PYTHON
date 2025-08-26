import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  patientId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  doctorId: Joi.number().integer().positive().required(),
  appointmentDate: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  queueType: Joi.string().valid('EMERGENCY','BOOKED','WALKIN').optional()
});

export const updateAppointmentSchema = Joi.object({
  appointmentDate: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional()
});

export const listAppointmentsSchema = Joi.object({
  patientId: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  doctorId: Joi.number().integer().positive().optional(),
  date: Joi.string().isoDate().optional()
});
