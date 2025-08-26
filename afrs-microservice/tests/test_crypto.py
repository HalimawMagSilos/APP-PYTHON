from app.crypto import encrypt, decrypt

def test_crypto_roundtrip():
    text = "secret-data"
    enc = encrypt(text)
    dec = decrypt(enc)
    assert dec == text
