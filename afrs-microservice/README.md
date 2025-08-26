# AFRS Microservice (AI Facial Recognition Service)

## Overview
AFRS provides:
- `POST /enroll` — enroll face embedding for `patient_id`
- `POST /match` — match incoming face to stored embeddings

Integrations:
- MySQL for encrypted embedding storage
- FAISS for similarity search
- RabbitMQ for minimal events
- AES-256 encryption for stored embeddings
- JWT + API Key auth

## Quick start (development)
1. Provision MySQL and RabbitMQ.
2. Set environment variables for DB and RabbitMQ (or edit `app/config.py`).
3. Initialize DB schema:

To test in terminal

curl.exe -v -X POST http://localhost/afrs-microservice/enroll/ `
  -H "x-api-key: dev-api-key" `
  -F "patient_id=123" `
  -F "image=@C:/Users/CLienT/Downloads/thor.jpg"  
  
  replace the actual path of image

  test result

  (.venv) PS C:\xampp\htdocs\Microservices - CORE 1> curl.exe -v -X POST http://localhost/afrs-microservice/enroll/ `
>>   -H "x-api-key: dev-api-key" `
>>   -F "patient_id=123" `
>>   -F "image=@C:/Users/CLienT/Downloads/thor.jpg"
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying [::1]:80...
* Connected to localhost (::1) port 80
> POST /afrs-microservice/enroll/ HTTP/1.1
> Host: localhost
> User-Agent: curl/8.4.0
> Accept: */*
> x-api-key: dev-api-key
> Content-Length: 16394
> Content-Type: multipart/form-data; boundary=------------------------TJxXNxpzgh3zWCNwD1J9I1
>
* We are completely uploaded and fine
< HTTP/1.1 200 OK
< Server: nginx/1.27.5
< Date: Mon, 18 Aug 2025 12:57:41 GMT
< Content-Type: application/json
< Content-Length: 53
< Connection: keep-alive
<
{"status":"enrolled","patient_id":123,"message":null}* Connection #0 to host localhost left intact

for matching

curl.exe -v -X POST http://localhost/afrs-microservice/match/ -H "x-api-key: dev-api-key" -F "image=@C:/Users/CLienT/Downloads/thor.jpg"

test result 
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying [::1]:80...
* Connected to localhost (::1) port 80
> POST /afrs-microservice/match/ HTTP/1.1
> Host: localhost
> User-Agent: curl/8.4.0
> Accept: */*
> x-api-key: dev-api-key
> Content-Length: 16286
> Content-Type: multipart/form-data; boundary=------------------------QCmQiFsHtfVsVOl9dZT663
>
* We are completely uploaded and fine
< HTTP/1.1 200 OK
< Server: nginx/1.27.5
< Date: Mon, 18 Aug 2025 12:59:14 GMT
< Content-Type: application/json
< Content-Length: 66
< Connection: keep-alive
<
{"matched_patient_id":123,"confidence":1.0,"decision":"duplicate"}* Connection #0 to host localhost left intact

if not matched

curl.exe -v -X POST http://localhost/afrs-microservice/match/ -H "x-api-key: dev-api-key" -F "image=@C:/Users/CLienT/Downloads/ryan.jpeg"

test result

* Connected to localhost (::1) port 80
> POST /afrs-microservice/match/ HTTP/1.1
> Host: localhost
> User-Agent: curl/8.4.0
> Accept: */*
> x-api-key: dev-api-key
> Content-Length: 84901
> Content-Type: multipart/form-data; boundary=------------------------dxESZHBw2m38tAfV3VCgSA
>
* We are completely uploaded and fine
< HTTP/1.1 200 OK
< Server: nginx/1.27.5
< Date: Mon, 18 Aug 2025 13:25:13 GMT
< Content-Type: application/json
< Content-Length: 81
< Connection: keep-alive
<
{"matched_patient_id":null,"confidence":0.8803545832633972,"decision":"no_match"}* Connection #0 to host localhost left intact

