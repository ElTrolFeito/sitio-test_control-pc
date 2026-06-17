import socket
import struct


def send_wol_packet(mac_address: str, broadcast_ip: str, port: int = 9) -> bool:
    """
    Send a Wake On LAN magic packet to the specified MAC address.
    
    Args:
        mac_address: MAC address in format "aa:bb:cc:dd:ee:ff" or "aa-bb-cc-dd-ee-ff"
        broadcast_ip: Broadcast IP address (e.g., "192.168.1.255")
        port: UDP port to send to (default 9)
    
    Returns:
        True if packet was sent successfully, False otherwise
    """
    # Normalize MAC address
    mac = mac_address.replace(":", "").replace("-", "").replace(".", "")
    if len(mac) != 12:
        print(f"[ERROR] Invalid MAC address format: {mac_address}")
        return False
    
    try:
        # Convert MAC to bytes
        mac_bytes = bytes.fromhex(mac)
    except ValueError:
        print(f"[ERROR] Invalid MAC address characters: {mac_address}")
        return False
    
    # Build magic packet: 6 bytes of 0xFF followed by 16 repetitions of MAC
    magic_packet = b"\xff" * 6 + mac_bytes * 16
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(magic_packet, (broadcast_ip, port))
        sock.close()
        print(f"[OK] WOL packet sent to {mac_address} via {broadcast_ip}:{port}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send WOL packet: {e}")
        return False
