const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost/afrs-microservice').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-api-key';

function ensureBlob(input, mime = "image/jpeg") {
  if (input instanceof Blob) {
    return input;
  }
  if (typeof input === "string" && input.startsWith("data:image")) {
    const byteChars = atob(input.split(",")[1]);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  }
  throw new Error("Invalid image input: must be Blob, File, or base64 string");
}

async function postForm(path, form) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: form,
  });

  let body;
  try {
    body = await res.json();
  } catch (e) {
    body = await res.text();
  }

  return { ok: res.ok, status: res.status, body };
}

// ---- Enroll a patient ----
// ---- Enroll a patient ----
export async function enrollPatient(patientId, imageFile) {
  const formData = new FormData();
  formData.append("image", ensureBlob(imageFile));
  formData.append("patient_id", patientId);

  const res = await postForm("/enroll/", formData);
  console.log("[FACIAL API] Enroll response:", res);

  if (!res.ok) {
    throw new Error(`Enroll failed: HTTP ${res.status}`);
  }

  const body = res.body;
  const success =
    body?.status === "enrolled" ||   // ✅ ADD THIS
    body?.status === "success" ||
    body?.success === true ||
    /enrolled/i.test(body?.message || "");

  if (!success) {
    throw new Error(`Enroll failed: ${JSON.stringify(body)}`);
  }

  return body;
}


// ---- Match a patient ----
export async function matchPatient(imageFile) {
  const formData = new FormData();
  formData.append("image", ensureBlob(imageFile));

  const res = await postForm("/match/", formData);
  console.log("[FACIAL API] Match response:", res);

  return { ok: res.ok, status: res.status, body: res.body };
}
