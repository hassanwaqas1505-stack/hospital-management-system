
import { useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import appointmentsData from '../../data/appointments'
import patientsData from '../../data/patients'
import doctorsData from '../../data/doctors'
import useLocalStorage from '../../hooks/useLocalStorage'
import { useAuth } from '../auth/AuthContext'

function Appointments() {
  const { user } = useAuth()

  const [appointments, setAppointments] = useLocalStorage(
    'hospital_appointments',
    appointmentsData
  )

  const [patients] = useLocalStorage(
    'hospital_patients',
    patientsData
  )

  const [doctors] = useLocalStorage(
    'hospital_doctors',
    doctorsData
  )

  const isDoctor = user?.role === 'Doctor'

  const currentDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(user?.doctorId)
  )

  const doctorName = currentDoctor?.name || user?.name

  const visibleAppointments = isDoctor
    ? appointments.filter((appointment) =>
        (
          appointment.doctorId &&
          String(appointment.doctorId) === String(user?.doctorId)
        ) ||
        appointment.doctorName?.trim().toLowerCase() ===
          doctorName?.trim().toLowerCase()
      )
    : appointments

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [viewingAppointment, setViewingAppointment] = useState(null)

  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    department: '',
    reason: '',
    status: 'Pending',
  })

  // Available doctors for new bookings.
  // During editing, keep the currently assigned doctor selectable
  // even if their availability has changed.
  const selectableDoctors = doctors.filter((doctor) => {
    const isCurrentlyAssigned =
      editingAppointment &&
      (
        String(doctor.id) === String(editingAppointment.doctorId) ||
        doctor.name.toLowerCase() ===
          editingAppointment.doctorName?.toLowerCase()
      )

    return doctor.availability === 'Available' || isCurrentlyAssigned
  })

  function resetForm() {
    setFormData({
      patientName: '',
      doctorId: '',
      doctorName: '',
      date: '',
      time: '',
      department: '',
      reason: '',
      status: 'Pending',
    })

    setEditingAppointment(null)
    setShowForm(false)
  }

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'doctorId') {
      const selectedDoctor = doctors.find(
        (doctor) => String(doctor.id) === String(value)
      )

      setFormData((previousData) => ({
        ...previousData,
        doctorId: value,
        doctorName: selectedDoctor?.name || '',
        department: selectedDoctor?.specialization || '',
      }))

      return
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  // Add or update appointment
  function handleSubmit(e) {
    e.preventDefault()

    if (isDoctor && !editingAppointment) return

    if (isDoctor) {
      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointment,
                status: formData.status,
              }
            : appointment
        )
      )

      resetForm()
      return
    }

    const selectedDoctor = doctors.find(
      (doctor) => String(doctor.id) === String(formData.doctorId)
    )

    if (!selectedDoctor) {
      alert('Please select a valid doctor.')
      return
    }

    const currentAssignedDoctorId = doctors.find(
      (doctor) =>
        String(doctor.id) === String(editingAppointment?.doctorId) ||
        doctor.name.toLowerCase() ===
          editingAppointment?.doctorName?.toLowerCase()
    )?.id

    const isKeepingCurrentDoctor =
      editingAppointment &&
      String(selectedDoctor.id) === String(currentAssignedDoctorId)

    if (
      selectedDoctor.availability !== 'Available' &&
      !isKeepingCurrentDoctor
    ) {
      alert('This doctor is currently unavailable. Please select another doctor.')
      return
    }

    const appointmentDetails = {
      ...formData,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
    }

    if (editingAppointment) {
      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointmentDetails,
                id: editingAppointment.id,
              }
            : appointment
        )
      )
    } else {
      const newAppointment = {
        ...appointmentDetails,
        id: Date.now(),
      }

      setAppointments((previousAppointments) => [
        ...previousAppointments,
        newAppointment,
      ])
    }

    resetForm()
  }

  function handleEdit(appointment) {
    if (isDoctor) return

    const matchedDoctor = doctors.find(
      (doctor) =>
        String(doctor.id) === String(appointment.doctorId) ||
        doctor.name.toLowerCase() ===
          appointment.doctorName?.toLowerCase()
    )

    setEditingAppointment(appointment)

    setFormData({
      patientName: appointment.patientName,
      doctorId: matchedDoctor ? String(matchedDoctor.id) : '',
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      department: appointment.department,
      reason: appointment.reason || '',
      status: appointment.status,
    })

    setShowForm(true)
  }

  function handleDoctorStatusEdit(appointment) {
    if (!isDoctor) return

    setEditingAppointment(appointment)

    setFormData({
      patientName: appointment.patientName,
      doctorId: appointment.doctorId
        ? String(appointment.doctorId)
        : '',
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      department: appointment.department,
      reason: appointment.reason || '',
      status: appointment.status,
    })

    setShowForm(true)
  }

  function handleDelete(id) {
    if (isDoctor) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this appointment?'
    )

    if (confirmDelete) {
      setAppointments((previousAppointments) =>
        previousAppointments.filter(
          (appointment) => appointment.id !== id
        )
      )
    }
  }

  const filteredAppointments = visibleAppointments.filter(
    (appointment) =>
      appointment.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {isDoctor ? 'My Appointments' : 'Appointments'}
          </h1>

          <p className="mt-2 text-slate-500">
            {isDoctor
              ? 'View and manage the status of your assigned appointments.'
              : 'Manage hospital appointments and schedules.'}
          </p>
        </div>

        {!isDoctor && (
          <button
            onClick={() => {
              setEditingAppointment(null)
              setFormData({
                patientName: '',
                doctorId: '',
                doctorName: '',
                date: '',
                time: '',
                department: '',
                reason: '',
                status: 'Pending',
              })
              setShowForm(true)
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search patient, doctor or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Doctor</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {appointment.patientName}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {appointment.doctorName}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {appointment.department}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {appointment.date}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {appointment.time}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      appointment.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'Completed'
                          ? 'bg-blue-100 text-blue-700'
                          : appointment.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      title="View appointment"
                      onClick={() => setViewingAppointment(appointment)}
                      className="rounded-lg p-2 text-cyan-600 hover:bg-cyan-50"
                    >
                      <Eye size={19} />
                    </button>

                    {isDoctor ? (
                      <button
                        title="Update appointment status"
                        onClick={() => handleDoctorStatusEdit(appointment)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={19} />
                      </button>
                    ) : (
                      <>
                        <button
                          title="Edit appointment"
                          onClick={() => handleEdit(appointment)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={19} />
                        </button>

                        <button
                          title="Delete appointment"
                          onClick={() => handleDelete(appointment.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={19} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredAppointments.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  {isDoctor
                    ? 'You have no appointments assigned yet.'
                    : 'No appointments found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Showing {filteredAppointments.length} of {visibleAppointments.length} appointments
      </p>

      {/* Add / Edit Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {isDoctor
                  ? 'Update Appointment Status'
                  : editingAppointment
                    ? 'Edit Appointment'
                    : 'Book New Appointment'}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  disabled={isDoctor || Boolean(editingAppointment)}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 disabled:bg-slate-100"
                >
                  <option value="">Select Patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 disabled:bg-slate-100"
                >
                  <option value="">Select Doctor</option>

                  {selectableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                      {doctor.availability !== 'Available'
                        ? ' (Unavailable - Existing Appointment)'
                        : ''}
                    </option>
                  ))}
                </select>

                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  required
                  readOnly
                  className="rounded-lg border bg-slate-50 p-3 outline-none focus:border-cyan-500"
                />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 disabled:bg-slate-100"
                />

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 disabled:bg-slate-100"
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Appointment Reason"
                  rows="3"
                  disabled={isDoctor}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 disabled:bg-slate-100 sm:col-span-2"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-5 py-3 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700"
                >
                  {isDoctor
                    ? 'Update Status'
                    : editingAppointment
                      ? 'Update Appointment'
                      : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Appointment Details
              </h2>

              <button
                onClick={() => setViewingAppointment(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Patient', viewingAppointment.patientName],
                ['Doctor', viewingAppointment.doctorName],
                ['Department', viewingAppointment.department],
                ['Date', viewingAppointment.date],
                ['Time', viewingAppointment.time],
                ['Reason', viewingAppointment.reason || 'Not provided'],
                ['Status', viewingAppointment.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <span className="font-medium text-slate-500">
                    {label}
                  </span>

                  <span className="text-right text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingAppointment(null)}
                className="rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
