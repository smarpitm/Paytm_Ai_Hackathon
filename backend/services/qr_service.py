import io
import base64
import qrcode
import os

def generate_upi_qr_bytes(customer_name: str, amount: float, tx_id: int) -> tuple[bytes, str]:
    merchant_vpa = os.getenv("MERCHANT_UPI_ID", "sharmakirana@paytm")
    merchant_name = os.getenv("MERCHANT_NAME", "Sharma Kirana Store")
    upi_uri = (
        f"upi://pay?pa={merchant_vpa}"
        f"&pn={merchant_name.replace(' ', '%20')}"
        f"&am={amount:.2f}"
        f"&cu=INR"
        f"&tn=Udhaar_Tx_{tx_id}"
    )

    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(upi_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#002970", back_color="white")  # Paytm Navy Blue

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()
    b64_str = base64.b64encode(png_bytes).decode("utf-8")
    return png_bytes, f"data:image/png;base64,{b64_str}"
