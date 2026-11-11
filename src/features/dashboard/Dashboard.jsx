
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Wallet,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react'

import StatCard from '../../components/common/StatCard'
import DashboardCharts from './DashboardCharts'

import useLocalStorage from '../../hooks/useLocalStorage'

import patientsData from '../../data/patients'
import doctorsData from '../../data/doctors'
import appointmentsData from '../../data/appointments'
import billsData from '../../data/bills'

import { useAuth } from '../auth/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  const [patients] = useLocalStorage(
    'hospital_patients',
    patientsData
  )

  const [doctors] = useLocalStorage(
    'hospital_doctors',
    doctorsData
  )

  const [appointments] = useLocalStorage(
    'hospital_appointments',
    appointmentsData
  )

  const [bills] = useLocalStorage(
    'hospital_bills',
    billsData
  )

  const today = new Date().toLocaleDateString('en-CA')

  // Patient status counts
  const activePatients = patients.filter(
    (patient) => (patient.status || 'Active') === 'Active'
  ).length

  const inactivePatients = patients.filter(
    (patient) => patient.status === 'Inactive'
  ).length

  // Find logged-in doctor's profile
  const currentDoctor = doctors.find(
    (doctor) =>
      String(doctor.id) === String(user?.doctorId)
  )

  const doctorName = currentDoctor?.name || user?.name

  // Show only appointments assigned to this doctor
  const myAppointments = appointments.filter(
    (appointment) =>
      (
        appointment.doctorId &&
        String(appointment.doctorId) === String(user?.doctorId)
      ) ||
      (
        appointment.doctorName?.trim().toLowerCase() ===
        doctorName?.trim().toLowerCase()
      )
  )

  // Find patients connected to this doctor's appointments
  const myPatientNames = [
    ...new Set(
      myAppointments.map(
        (appointment) =>
          appointment.patientName?.trim().toLowerCase()
      ).filter(Boolean)
    ),
  ]

  const myPatients = patients.filter(
    (patient) =>
      (
        patient.doctorId &&
        String(patient.doctorId) === String(user?.doctorId)
      ) ||
      myPatientNames.includes(
        patient.name?.trim().toLowerCase()
      )
  )

  // Doctor's own patient status counts
  const myActivePatients = myPatients.filter(
    (patient) => (patient.status || 'Active') === 'Active'
  ).length

  const myInactivePatients = myPatients.filter(
    (patient) => patient.status === 'Inactive'
  ).length

  const todayMyAppointments = myAppointments.filter(
    (appointment) => appointment.date === today
  ).length

  const upcomingAppointments = myAppointments
    .filter(
      (appointment) =>
        appointment.date >= today &&
        appointment.status !== 'Cancelled' &&
        appointment.status !== 'Completed'
    )
    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(
        `${b.date} ${b.time}`
      )
    )

  // Doctor Dashboard
  if (user?.role === 'Doctor') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, {doctorName}
          </h1>

          <p className="mt-2 text-slate-500">
            Here is your personal medical dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="My Patients"
            value={myPatients.length.toLocaleString()}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Active Patients"
            value={myActivePatients.toLocaleString()}
            icon={UserCheck}
            color="bg-green-100 text-green-600"
          />

          <StatCard
            title="Inactive Patients"
            value={myInactivePatients.toLocaleString()}
            icon={UserX}
            color="bg-red-100 text-red-600"
          />

          <StatCard
            title="Today's Appointments"
            value={todayMyAppointments.toLocaleString()}
            icon={CalendarCheck}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 p-5">
            <Clock className="text-cyan-600" size={21} />

            <h2 className="text-lg font-bold text-slate-800">
              My Upcoming Appointments
            </h2>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Patient</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {upcomingAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {appointment.patientName}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {appointment.date}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {appointment.time}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {appointment.department}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-center text-slate-500">
              You have no upcoming appointments.
            </p>
          )}
        </div>

        {/* My Patients */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-800">
              My Patients
            </h2>
          </div>

          {myPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Patient Name</th>
                    <th className="px-5 py-4">Age</th>
                    <th className="px-5 py-4">Gender</th>
                    <th className="px-5 py-4">Phone</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {myPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {patient.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {patient.age}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {patient.gender}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {patient.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-center text-slate-500">
              No patients are assigned to you yet.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Admin and Receptionist Dashboard
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today
  ).length

  const totalRevenue = bills
    .filter((bill) => bill.status === 'Paid')
    .reduce(
      (total, bill) =>
        total + Number(bill.amount || 0),
      0
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome to your Hospital Management System.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Patients"
          value={patients.length.toLocaleString()}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="Active Patients"
          value={activePatients.toLocaleString()}
          icon={UserCheck}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Inactive Patients"
          value={inactivePatients.toLocaleString()}
          icon={UserX}
          color="bg-red-100 text-red-600"
        />

        <StatCard
          title="Total Doctors"
          value={doctors.length.toLocaleString()}
          icon={Stethoscope}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Today's Appointments"
          value={todayAppointments.toLocaleString()}
          icon={CalendarCheck}
          color="bg-purple-100 text-purple-600"
        />

        <StatCard
          title="Total Revenue"
          value={`Rs. ${totalRevenue.toLocaleString('en-PK')}`}
          icon={Wallet}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      <DashboardCharts appointments={appointments} />
    </div>
  )
}

export default Dashboard
