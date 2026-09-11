# TRACKING_FIXES.md

Istruzioni manuali per correggere il disallineamento tra i click dichiarati da Meta Ads
e le sessioni/conversioni registrate in GA4 per le campagne verso
`https://www.tenutamacconi.it/#prenota`.

Queste operazioni **non sono modificabili da codice** (sono impostazioni di pannello) e
vanno eseguite direttamente in GA4 Admin e Meta Ads Manager.

## a) GA4 — Elenco referral esclusi

Quando un utente clicca un'ad e torna dall'app Facebook/Instagram al browser, il dominio
dell'app (es. `l.facebook.com`) viene talvolta registrato da GA4 come sorgente di
referral, creando una nuova sessione "Referral" che spezza l'attribuzione originale
della campagna (session scoped attribution) e falsa i numeri rispetto a Meta Ads.

Passi:

1. Vai su **GA4 Admin** (icona ingranaggio in basso a sinistra).
2. Nella colonna "Data collection and modification" apri **Data Streams**.
3. Seleziona lo stream web di tenutamacconi.it.
4. Apri **Configura impostazioni tag** ("Configure tag settings").
5. Clicca **Mostra altro** ("Show more").
6. Apri **Elenco referral esclusi** ("List unwanted referrals").
7. Clicca **Aggiungi condizione** e inserisci, una per riga (match type "contiene"):
   - `facebook.com`
   - `m.facebook.com`
   - `l.facebook.com`
   - `lm.facebook.com`
   - `instagram.com`
   - `l.instagram.com`
8. Salva.

> Nota: questa modifica non è retroattiva, si applica solo al traffico raccolto da
> quel momento in poi.

## b) Meta Ads Manager — Parametri URL della campagna

Senza UTM espliciti, GA4 deve indovinare la sorgente/mezzo del traffico dagli ad click
IDs (`fbclid`), che è meno affidabile e porta a sessioni classificate come
"(direct)/(none)" invece che "Facebook / cpc", impedendo il confronto diretto con i
dati di Meta Ads Manager.

Passi:

1. Vai su **Meta Ads Manager**.
2. Apri la campagna **"Campagna_camere_tenuta_macconi"**.
3. Clicca **Modifica** sulla campagna (o sui singoli ad set/ad, secondo dove si vuole
   applicare il tracciamento).
4. Scendi alla sezione **Tracciamento** ("Tracking").
5. Nel campo **Parametri URL** ("URL parameters") incolla:

   ```
   utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
   ```

6. Clicca **Applica** e poi **Pubblica**.

> Nota: i placeholder `{{campaign.name}}`, `{{ad.name}}`, `{{adset.name}}` sono
> variabili dinamiche di Meta e vengono sostituite automaticamente con i valori reali
> al click sull'annuncio — non sostituirle manualmente.

## Verifica

Dopo aver applicato entrambe le modifiche, attendi che alcuni click reali arrivino
sull'annuncio, poi controlla in **GA4 → Esplora → Acquisizione traffico** che le
sessioni da Meta compaiano come `facebook / cpc` con la campagna corretta, e non più
come `(direct) / (none)` o come referral da domini Facebook/Instagram.

## Nota sul codice del sito

Questo repository (`fb-ads-dashboard`) contiene solo la dashboard di reportistica che
legge i dati da Meta Ads e GA4 via API — non contiene il codice del sito
tenutamacconi.it. Gli interventi lato codice richiesti nel task originale (verifica
tracciamento sull'ancora `#prenota`, evento di conversione sul form di prenotazione,
Consent Mode v2, ordine di caricamento tag vs cookie banner) vanno effettuati nel
repository/CMS del sito, non qui.
