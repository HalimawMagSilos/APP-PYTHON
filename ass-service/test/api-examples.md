# ASS API examples (base http://localhost:4000)

## Create appointment
Invoke-WebRequest -Uri "http://localhost:4000/appointments" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body '{
        "patientId": "SPRS-1001",
        "doctorId": 1,
        "appointmentDate": "2025-08-25",
        "startTime": "10:00:00",
        "endTime": "10:20:00",
        "queueType": "BOOKED"
    }'


## Reschedule
Invoke-WebRequest -Uri "http://localhost:4000/appointments/1" `
    -Method PUT `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body '{"appointmentDate":"2025-08-26","startTime":"11:00:00","endTime":"11:15:00"}'

## Cancel
curl -i -X DELETE http://localhost:4000/appointments/1

## List
curl "http://localhost:4000/appointments?doctorId=1&date=2025-08-25"

## Queue
curl "http://localhost:4000/queue?doctorId=1&date=$(date +%F)"
