import { Router } from 'express';
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointments
} from '../controllers/appointmentController.js';

const router = Router();

router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.get('/', listAppointments);

export default router;
