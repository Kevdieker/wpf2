# KevTube – YouTube-Klon mit Bot-Interaktion

KevTube ist eine Video-Plattform, die es Benutzern ermöglicht, vordefinierte Videos anzusehen, zu liken und zu kommentieren. Zusätzlich enthält das System eine Bot-Verwaltung, die automatisierte Interaktionen wie Liken und Kommentieren durchführt.

---

## 📌 Funktionsumfang

### 1.2.1 Muss-Kriterien (Pflichtteil, ca. 60% des Aufwands)

 **M1** Entwicklung einer Webplattform, auf der Benutzer vordefinierte Videos ansehen können.  
 **M2** Implementierung einer Funktion zum Liken von Videos.  
 **M3** Implementierung einer Kommentarfunktion für Videos.  
 **M4** Bereitstellung einer REST API-Funktion zum Abrufen aller Video-Posts.  
 **M5** Bereitstellung einer REST API-Funktion zum Abrufen eines spezifischen Videos mit Details.  
 **M6** Bereitstellung einer REST API-Funktion zum Liken eines Videos.  
 **M7** Bereitstellung einer REST API-Funktion zum Hinzufügen eines Kommentars zu einem Video.  
 **M8** Speicherung von Konten (Benutzernamen und Passwörter).  
 **M9** Speicherung von Interaktionsdaten, z. B. welcher Benutzer welchen Kommentar gepostet hat und welche Videos geliked hat.  
 **M10** Bots können sich bei der Plattform anmelden.  
 **M11** Bots können Videos liken.  
 **M12** Bots können vordefinierte Kommentare wie "I am a bot" posten.  
 **M13** Bots nutzen die API der Video-Plattform zum Liken von Videos.  
 **M14** Bots nutzen die API zum Posten von Kommentaren.  
 **M15** Bots verwenden die API, um verfügbare Videos abzurufen.  
 **M16** Entwicklung einer Anwendung zur Verwaltung der Bots.  
 **M17** Möglichkeit, Bots zu aktivieren und deaktivieren.  
 **M18** Erstellung von Bot-Instanzen basierend auf der gewünschten Anzahl.  
 **M19** Zuweisung von Bots zu spezifischen Videos anhand der Video-ID.  
 **M20** Bots liken die zugewiesenen Videos.  
 *M21** Bots posten Kommentare auf den zugewiesenen Videos.  
 **M22** Speicherung aller Bot-Konten in der Plattform-Datenbank.  
 **M23** Speicherung von Video-Metadaten in der Plattform-Datenbank.

---

### 1.2.2 Soll-Kriterien (ca. 20% des Aufwands)

 **S1** Implementierung einer Registrierungsfunktion für neue Benutzer.  
 **S2** Entwicklung einer Login-Funktionalität.  
 **S3** Anzeige von Videobeschreibungen und Transkripten.  
 **S4** Implementierung der Anzeige von Upload-Datum und anderen Metadaten.  
 **S5** Bots posten variierende Kommentare aus einer Liste vordefinierter Nachrichten.  
 **S6** Anzeige des Status jedes Bots (aktiv, inaktiv) im Bot-Steuerungsmanager.

---

### 1.2.3 Kann-Kriterien (ca. 20% des Aufwands)

**K1** Bots führen Aktionen in zufälligen Zeitintervallen aus, um menschliches Verhalten zu simulieren.  
**K2** Protokollierung aller Aktionen der Bots (Likes, Kommentare).  
**K3** Bots interagieren gleichzeitig mit mehreren Videos.  
**K4** Einstellbare Kommentarhäufigkeit pro Bot.  
**K5** Anpassbare Likerate für jeden Bot.  
**K6** Festlegung von aktiven Zeiten, in denen Bots agieren.

---

## 🛠 Technologie-Stack

- **Frontend**: React mit TypeScript
- **Backend**: Node.js mit Express
- **Datenbank**: MongoDB mit Mongoose
- **Botsimulation**: Node.js Skripte mit REST API-Anfragen
- **Datei-Uploads**: Multer (für das Hochladen von Videodateien)

---

## 🔧 Installation & Setup

### 1️⃣ Backend installieren

1. **Repository klonen**
   ```bash
   git clone https://github.com/dein-repo/kevtube.git
   cd kevtube
1. **Depedencies installieren**
    ```bash
   npm install
