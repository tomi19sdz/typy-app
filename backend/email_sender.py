import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# WAŻNE: W środowisku produkcyjnym na Render.com, te zmienne powinny być ustawione
# jako zmienne środowiskowe (Environment Variables) w panelu Render.com.
# NIE umieszczaj tutaj swoich prawdziwych danych logowania do poczty!
# Na potrzeby testów możesz je tymczasowo zakodować, ale usuń je przed wdrożeniem produkcyjnym.

# Przykład dla Gmaila (wymaga włączenia "Less secure app access" lub "App passwords" w ustawieniach konta Google)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587)) # 587 dla TLS, 465 dla SSL
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "twoj_email@gmail.com") # Adres e-mail, z którego będą wysyłane wiadomości
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "twoje_haslo_lub_haslo_aplikacji") # Hasło lub hasło aplikacji

# Adres e-mail, na który będą przychodzić wiadomości z formularza kontaktowego
RECEIVING_EMAIL = os.getenv("RECEIVING_EMAIL", "kontakt@typy-pilkarskie.pl") # Docelowy adres e-mail

def send_contact_email(name: str, sender_email: str, message: str) -> bool:
    """
    Wysyła wiadomość e-mail z formularza kontaktowego.
    """
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD or not RECEIVING_EMAIL:
        print("Błąd konfiguracji SMTP: Brak adresu e-mail nadawcy, hasła lub adresu odbiorcy.")
        return False

    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = RECEIVING_EMAIL
    msg['Subject'] = f"Wiadomość z formularza kontaktowego od {name} ({sender_email})"

    body = f"Imię: {name}\n" \
           f"E-mail: {sender_email}\n" \
           f"Wiadomość:\n{message}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls() # Użyj TLS (Transport Layer Security)
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"E-mail od {sender_email} wysłany pomyślnie na {RECEIVING_EMAIL}.")
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłania e-maila: {e}")
        return False

