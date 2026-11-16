# YouTube auto-upload setup (ek baar karna hai)

**Kya automatic hai:** roz ka title (#shorts ke saath), description (hashtags + subscribe line), tags, category, Hindi language, "Made for kids: No", aur shaam 7 baje (IST) ka scheduled publish. Upload ke baad YouTube link Release notes mein aa jaata hai. Upload se pehle metadata ki jaanch hoti hai; gadbad ho to publish ruk jaata hai.
**Kya manual rahega:** comment ko **pin** karna (YouTube API pin karne nahi deta). Pinned comment ka text har Release ke `youtube.md` mein milega.

Ye steps aapko khud karne hain (Google aur GitHub ke login aapke paas hain). Koi bhi ID, secret ya token **chat mein mat bhejna**, sirf GitHub Secrets mein daalna.

## 1. Google Cloud project
1. https://console.cloud.google.com par usi Google account se login karo jisse YouTube channel bana hai.
2. Naya project banao: `itihaas-ke-bhoot`.
3. **APIs & Services → Library** → "YouTube Data API v3" → **Enable**.

## 2. OAuth consent screen
1. **Google Auth Platform → Branding**: app name `Itihaas Ke Bhoot Uploader`, apna email.
2. **Audience**: User type **External**. Phir **Publish app** dabao, taaki status **In production** ho jaaye. Agar "Testing" mein rahega to har 7 din mein token expire ho jaayega.
3. **Data access**: scope add karo `https://www.googleapis.com/auth/youtube.upload`.

## 3. OAuth client
1. **Clients → Create client** → type **Web application**.
2. **Authorized redirect URIs** mein daalo: `https://developers.google.com/oauthplayground`
3. **Client ID** aur **Client secret** copy karke kahin safe rakh lo.

## 4. Refresh token (browser mein hi)
1. https://developers.google.com/oauthplayground kholo.
2. Upar right mein ⚙️ → **Use your own OAuth credentials** tick karo → apna Client ID aur Secret daalo.
3. Step 1 mein scope likho `https://www.googleapis.com/auth/youtube.upload` → **Authorize APIs** → channel wale account se login karo.
   - "Google hasn't verified this app" aaye to **Advanced → Continue** dabao. Ye aapka hi app hai.
4. Step 2 mein **Exchange authorization code for tokens** dabao → **Refresh token** copy karo.

## 5. GitHub Secrets
Repo `syro777/Itihass-ke-bhoot` → **Settings → Secrets and variables → Actions → New repository secret**:
- `YT_CLIENT_ID`
- `YT_CLIENT_SECRET`
- `YT_REFRESH_TOKEN`

## 6. YouTube API audit (zaroori)
YouTube ka rule hai: jo Google project audit pass nahi karta, uske API se upload hue videos **Private mein lock** ho jaate hain, aur unhe public nahi kiya ja sakta.
- Form: https://support.google.com/youtube/contact/yt_api_form ("YouTube API Services – Audit and Quota Extension").
- Likhna: "Internal tool that uploads videos to my own channel only (Itihaas Ke Bhoot). No other users."
- Approval mein kuch din se kuch hafte lag sakte hain.

## 7. Auto-upload chalu karna (audit approve hone ke baad)
Repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**: `AUTO_UPLOAD` = `true`.

Iske baad roz ka video 7 PM IST par scheduled publish ke liye apne aap upload hoga.

**Test:** Actions → "Upload Short to YouTube" → **Run workflow** → kisi release ka tag daalo.

**Audit se pehle:** roz ka video GitHub ke **Releases** mein milega (MP4 aur title/description ke saath). Use YouTube app se upload karna, isme 1 minute lagta hai.
