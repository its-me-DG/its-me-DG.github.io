// Creazione e configurazione di Wavesurfer per visualizzare e gestire la forma d'onda audio
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#FFF',
  progressColor: '#888',
  height: 70,
  normalize: true,
  responsive: true,
});

wavesurfer.load('beat.mp3');

// Gestione del pulsante Play/Pausa per controllare la riproduzione audio
const playPauseBtn = document.getElementById('playPauseBtn');

playPauseBtn.classList.add('paused');
playPauseBtn.textContent = 'Play';

playPauseBtn.addEventListener('click', () => {
  wavesurfer.playPause();
  const isPlaying = wavesurfer.isPlaying();
  playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
  playPauseBtn.classList.toggle('playing', isPlaying);
  playPauseBtn.classList.toggle('paused', !isPlaying);
});

wavesurfer.on('finish', () => {
  playPauseBtn.textContent = 'Play';
  playPauseBtn.classList.remove('playing');
  playPauseBtn.classList.add('paused');
});

const waveform = document.getElementById('waveform');

let isDragging = false;

waveform.addEventListener('touchstart', (e) => {
  isDragging = true;
});

// Gestione dello spostamento del dito sulla forma d'onda per navigare nell'audio (touchmove)
waveform.addEventListener('touchmove', function(e) {
  if (isDragging) {
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = waveform.getBoundingClientRect();
    const x = touch.clientX - rect.left;

    const percent = Math.max(0, Math.min(1, x / rect.width));
    wavesurfer.seekTo(percent);
  }
}, { passive: false }); 

waveform.addEventListener('touchend', (e) => {
  isDragging = false;
});

// Gestione selezione carte: seleziona o naviga alla pagina della carta cliccata
document.querySelectorAll('.card-item').forEach(card => {
  card.addEventListener('click', function(e) {
    // Ferma la propagazione per evitare il click sul documento
    e.stopPropagation();
    if (this.classList.contains('selected')) {
      window.location.href = this.getAttribute('data-url');
    } else {
      document.querySelectorAll('.card-item.selected').forEach(el => el.classList.remove('selected'));
      this.classList.add('selected');
    }
  });
});

// Gestione click fuori dalla griglia: deseleziona tutte le carte
document.addEventListener('click', function(e) {
  const grid = document.querySelector('.cards-grid');
  if (grid && !grid.contains(e.target)) {
    document.querySelectorAll('.card-item.selected').forEach(el => el.classList.remove('selected'));
  }
});

const verificaBtn = document.getElementById('verificaCodiceBtn');
const codiceInput = document.getElementById('codiceBeat');
const feedback = document.getElementById('codiceFeedback');
const downloadBtn = document.getElementById('downloadBeatBtn');

verificaBtn.addEventListener('click', async function() {
    try {
    const password = codiceInput.value.replace(/"/g,'').trim();
    const d = document.getElementById('hx2f');
    const storedPwd = atob(d.dataset.b64pwd);
    const storedUrl = atob(d.dataset.b64url);

    feedback.textContent = 'Verifico...';
    feedback.style.color = '#333';

    if (password === storedPwd) {
        downloadBtn.href = storedUrl;
        downloadBtn.style.display = "inline-block";
        downloadBtn.setAttribute('target', '_blank');

        feedback.textContent = "Codice corretto! Scarica il beat qui sotto.";
        feedback.style.color = "#15af15";
    } else {
        downloadBtn.href = '';
        downloadBtn.style.display = "none";

        feedback.textContent = "Codice errato, riprova!";
        feedback.style.color = "#e74c3c";
    }
    } catch (err) {
    console.error('Errore nel listener verificaCodiceBtn:', err);
    feedback.textContent = "Si è verificato un errore. Riprova.";
    feedback.style.color = "#e74c3c";
    downloadBtn.style.display = "none";
    downloadBtn.href = '';
    }
});

// ==================== Selezione mesi e settimane ====================
    // const weekElems = document.querySelectorAll('.calendar-week');
    const container = document.getElementById('calendar-days-container');

    let datiPuliti = []; // sarà riempito dal fetch CSV


    function formattaData(date) {
      return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth()+1).padStart(2,'0');
    }

    function formattaSlotJS(testoColonna, orario) {
      try {
        const dateMatch = testoColonna.match(/(\d{1,2})\/(\d{1,2})/);
        if (!dateMatch) return testoColonna + " " + orario;

        const giorno = dateMatch[1].padStart(2, '0');
        const mese = dateMatch[2].padStart(2, '0');
        const anno = String(new Date().getFullYear()).slice(-2);

        const orari = orario.split(" - ");
        let fasciaOraria = "";
        if (orari.length === 1) {
          fasciaOraria = orari[0];
        } else {
          fasciaOraria = `${orari[0]} - ${orari[1]}`;
        }

        return `${giorno}/${mese}/${anno}, ${fasciaOraria}`;
      } catch (e) {
        return testoColonna + " " + orario;
      }
    }

    // Funzione per estrarre l'anno dal testo del mese
    function parseAnno(meseTesto) {
      const parts = meseTesto.split("'");
      return 2000 + parseInt(parts[1]);
    }

    const mesiMap = {
      'gennaio':0,'febbraio':1,'marzo':2,'aprile':3,'maggio':4,'giugno':5,
      'luglio':6,'agosto':7,'settembre':8,'ottobre':9,'novembre':10,'dicembre':11
    };


    // Nuova funzione per generare settimane dinamiche
    function generaSettimaneDinamiche(meseTesto) {
      const containerSettimane = document.querySelector('.calendar-weeks-wrapper');
      containerSettimane.innerHTML = '';

      const parti = meseTesto.split(" '");
      const meseNome = parti[0].toLowerCase();
      const anno = 2000 + parseInt(parti[1]);
      const meseIndex = mesiMap[meseNome];

      const giorniNelMese = new Date(anno, meseIndex + 1, 0).getDate();
      let giornoInizio = 1;

      for (let i = 0; i < 4; i++) {
        const giorniPerSettimana = Math.floor(giorniNelMese / 4);
        const extra = i < (giorniNelMese % 4) ? 1 : 0;
        const giornoFine = giornoInizio + giorniPerSettimana + extra - 1;

        const start = new Date(anno, meseIndex, giornoInizio);
        const end = new Date(anno, meseIndex, Math.min(giornoFine, giorniNelMese));

        const oggi = new Date();
        oggi.setHours(0,0,0,0);
        if (end < oggi) {
          giornoInizio = giornoFine + 1;
          continue;
        }

        // Verifica se ci sono date nel dataset
        const hasData = datiPuliti.some(r => {
          const rData = new Date(r.data + "T00:00:00");
          return rData >= start && rData <= end;
        });
        if (!hasData) {
          giornoInizio = giornoFine + 1;
          continue;
        }

        // Crea div settimana
        const div = document.createElement('div');
        div.classList.add('calendar-week');
        div.textContent = `${formattaData(start)} - ${formattaData(end)}`;
        div.dataset.start = start.toISOString();
        div.dataset.end = end.toISOString();
        containerSettimane.appendChild(div);

        // Listener click settimana
        div.addEventListener('click', function() {
          containerSettimane.querySelectorAll('.calendar-week').forEach(w => w.classList.remove('selected'));
          this.classList.add('selected');
          this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          mostraGiorniSelezionati();
        });

        giornoInizio = giornoFine + 1;
      }
    }

    // Funzione aggiornata mostraGiorniSelezionati con colonne fantasma ricreate ogni volta
    function mostraGiorniSelezionati() {
      const meseTesto = document.querySelector('.calendar-month.selected').textContent;
      const settimanaSelezionata = document.querySelector('.calendar-week.selected');
      if (!settimanaSelezionata) return;

      const start = new Date(settimanaSelezionata.dataset.start);
      const end = new Date(settimanaSelezionata.dataset.end);

      container.innerHTML = '';

      // Filtra i dati solo per la settimana selezionata
      const filtrati = datiPuliti.filter(r => {
        const rData = new Date(r.data + "T00:00:00");
        return rData >= start && rData <= end;
      });

      // Escludi giorni passati
      const oggi = new Date();
      oggi.setHours(0,0,0,0);
      const filtratiValidi = filtrati.filter(r => new Date(r.data + "T00:00:00") >= oggi);

      if (filtratiValidi.length === 0) {
        container.innerHTML = '<p>Nessuna data disponibile per la settimana selezionata.</p>';
        return;
      }

      // Raggruppa per giorno
      const giorniMap = {};
      filtratiValidi.forEach(r => {
        if (!r.slot) return;
        if (!giorniMap[r.data]) {
          giorniMap[r.data] = { giorno: r.giorno, data: r.data, slots: [] };
        }
        giorniMap[r.data].slots.push({ slot: r.slot, stato: r.stato });
      });

      // Ordina i giorni per data crescente
      const giorniOrdinati = Object.values(giorniMap).sort((a,b) => new Date(a.data) - new Date(b.data));

      // Wrapper
      const colonneWrapper = document.createElement('div');
      colonneWrapper.style.display = 'flex';
      colonneWrapper.style.gap = '16px';
      colonneWrapper.style.justifyContent = 'flex-start';
      colonneWrapper.style.alignItems = 'flex-start';
      colonneWrapper.style.overflowY = 'hidden';
      colonneWrapper.style.overflowX = 'auto';
      colonneWrapper.style.scrollSnapType = 'x mandatory';
      colonneWrapper.style.whiteSpace = 'nowrap';

      colonneWrapper.style.paddingLeft = '65px';
      colonneWrapper.style.paddingRight = '50px';

      // Funzione per creare una colonna giorno
      function creaColonnaGiorno(g) {
        const colonna = document.createElement('div');
        colonna.classList.add('calendar-day-column');
        colonna.style.minWidth = '120px';
        colonna.style.background = '#fff8';
        colonna.style.borderRadius = '10px';
        colonna.style.boxShadow = '0 1px 6px #0001';
        colonna.style.padding = '10px 8px 14px 8px';
        colonna.style.display = 'flex';
        colonna.style.flexDirection = 'column';
        colonna.style.alignItems = 'center';
        colonna.style.border = '2px solid transparent';
        colonna.style.scrollSnapAlign = 'center';

        const giorniSettimana = {
          lunedi: "lunedì",
          martedi: "martedì",
          mercoledi: "mercoledì",
          giovedi: "giovedì",
          venerdi: "venerdì",
          sabato: "sabato",
          domenica: "domenica"
        };
        const [anno, mese, giorno] = g.data.split("-");
        const dataFormattata = `${giorno}/${mese}`;
        const titolo = document.createElement('div');
        titolo.textContent = `${giorniSettimana[g.giorno.toLowerCase()] || g.giorno} ${dataFormattata}`;
        titolo.style.fontWeight = 'bold';
        titolo.style.marginBottom = '8px';
        colonna.appendChild(titolo);

        const lista = document.createElement('ul');
        lista.style.listStyle = 'none';
        lista.style.padding = '0';
        lista.style.margin = '0';
        lista.style.width = '100%';
        g.slots.forEach(s => {
          const li = document.createElement('li');
          li.textContent = s.slot;
          li.style.margin = '4px 0';
          li.style.padding = '6px 8px';
          li.style.borderRadius = '6px';
          li.style.display = 'block';
          li.style.textAlign = 'center';
          li.style.border = '2px solid';
          li.style.borderColor = s.stato === 'libero' ? 'green' : 'red';
          // Nuova logica: sia libero che occupato sono cliccabili e gestiti
          if (s.stato === 'libero' || s.stato === 'occupato') {
            li.classList.add(s.stato);
            li.style.background = s.stato === 'libero' ? 'rgba(0, 200, 0, 0.12)' : 'rgba(200, 0, 0, 0.14)';
            li.style.color = '#000';
            li.style.textDecoration = s.stato === 'occupato' ? 'line-through' : 'none';
            li.style.fontWeight = s.stato === 'occupato' ? '400' : '500';

            li.addEventListener('click', () => {
              // Deseleziona tutti gli slot selezionati in qualsiasi giorno
              document.querySelectorAll('li.selected-slot').forEach(el => {
                el.classList.remove('selected-slot');
                el.style.background = el.classList.contains('libero')
                  ? 'rgba(0, 200, 0, 0.12)'
                  : 'rgba(200, 0, 0, 0.14)';
              });

              // Seleziona il nuovo slot
              li.classList.add('selected-slot');
              li.style.background = s.stato === 'libero' ? '#fff4b2' : '#ffd3b2';

              // Aggiorna testo pulsante Prenota
              const prenotaBtn = document.getElementById('prenotaBtn');
              prenotaBtn.textContent = s.stato === 'libero' ? 'Prenota' : 'Mettiti in coda';

              // Aggiorna campo slot selezionato nel form
              const giornoColonna = li.closest('.calendar-day-column').querySelector('div').textContent;
              slotInput.value = formattaSlotJS(giornoColonna, li.textContent);

              // Aggiorna testo pulsante form dinamicamente
              const formSubmitBtn = calendarForm.querySelector('button[type="submit"]');
              if (s.stato === 'libero') {
                formSubmitBtn.textContent = 'Conferma prenotazione';
              } else {
                formSubmitBtn.textContent = 'Richiedi disponibilità';
              }
            });
          }
          lista.appendChild(li);
        });
        colonna.appendChild(lista);

        return colonna;
      }

      // Aggiungi giorni reali
      giorniOrdinati.forEach(g => colonneWrapper.appendChild(creaColonnaGiorno(g)));

      container.appendChild(colonneWrapper);

      // Evidenziazione centrale solo sui giorni reali
      function aggiornaSelezioneDinamica() {
        const giorni = Array.from(colonneWrapper.querySelectorAll('.calendar-day-column'));
        if (!giorni.length) return;

        const wrapperRect = colonneWrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

        let closest = null;
        let minDistance = Infinity;

        giorni.forEach(col => {
          const colRect = col.getBoundingClientRect();
          const colCenter = colRect.left + colRect.width/2;
          const distance = Math.abs(wrapperCenter - colCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closest = col;
          }
        });

        if (!closest) return;

        giorni.forEach(col => col.classList.remove('selected','adjacent'));
        const idx = giorni.indexOf(closest);
        closest.classList.add('selected');
        if (idx > 0) giorni[idx-1].classList.add('adjacent');
        if (idx < giorni.length-1) giorni[idx+1].classList.add('adjacent');
      }

      colonneWrapper.addEventListener('scroll', () => {
        window.requestAnimationFrame(aggiornaSelezioneDinamica);
      });

      colonneWrapper.querySelectorAll('.calendar-day-column').forEach(col => {
        col.addEventListener('click', () => {
          const targetScrollLeft = col.offsetLeft - colonneWrapper.offsetWidth/2 + col.offsetWidth/2;
          colonneWrapper.scrollTo({left: targetScrollLeft, behavior:'smooth'});
          setTimeout(aggiornaSelezioneDinamica,100);
        });
      });

      setTimeout(aggiornaSelezioneDinamica,100);

      // (Listener per aggiornamento testo pulsante Prenota già gestito nel listener sopra)
    }

    // ==================== Lettura dati da Google Sheet ====================
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSLT_I2rcORLFxgO1x11AT7BaEDtgY3Vwz-EX1dXBGcpCAKy86_d7BeWCLFj1kJcG8Ll5qM0Ji5jEr8/pub?output=csv")
      .then(response => response.text())
      .then(csv => {
        const righe = csv.split("\n").map(r => r.split(","));
        console.log("Dati dal Google Sheet:", righe);

        const intestazioni = righe.shift();
        datiPuliti = righe
          .filter(r => r[0] && r[1]) // ignora righe vuote o incomplete
          .map(r => ({
            data: r[0].trim(),
            giorno: r[1].trim(),
            mese: r[2]?.trim().toLowerCase(),
            slot: r[3]?.trim(),
            stato: r[4]?.trim().toLowerCase()
          }));

        function generaMesiDinamici(dati) {
          const containerMesi = document.querySelector('.calendar-months-wrapper');
          containerMesi.innerHTML = '';
          
          const oggi = new Date();
          oggi.setHours(0,0,0,0);
          const datiFuturi = dati.filter(r => {
            const d = new Date(r.data + "T00:00:00");
            return d >= oggi;
          });
          
          // Estrai tutte le date valide dal dataset
          const dateUniche = Array.from(new Set(datiFuturi.map(r => r.data).filter(d => d)));
          
          // Estrai mese+anno
          const mesiSet = new Set();
          dateUniche.forEach(d => {
            const [anno, mese] = d.split("-");
            if(anno && mese) mesiSet.add(`${mese.padStart(2,'0')}-${anno}`);
          });
          
          // Ordina in ordine crescente
          const mesiOrdinati = Array.from(mesiSet).sort((a,b) => {
            const [m1, y1] = a.split("-");
            const [m2, y2] = b.split("-");
            return new Date(y1, m1-1, 1) - new Date(y2, m2-1, 1);
          });
          
          // Nomi mesi italiani
          const nomiMesi = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                            "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
          
          mesiOrdinati.forEach((m,i) => {
            const [mese, anno] = m.split("-");
            const div = document.createElement('div');
            div.classList.add('calendar-month');
            if(i===0) div.classList.add('selected'); // primo mese selezionato
            div.textContent = `${nomiMesi[parseInt(mese,10)-1]} '${anno.slice(2)}`;
            div.addEventListener('click', function() {
              // Rimuove la selezione da tutti
              containerMesi.querySelectorAll('.calendar-month').forEach(el => el.classList.remove('selected'));
              this.classList.add('selected');
              this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              container.innerHTML = '';
              // weekElems.forEach(w => w.classList.remove('selected'));
              generaSettimaneDinamiche(this.textContent);

              // Seleziona prima settimana visibile
              const primaSettimana = document.querySelector('.calendar-week');
              if (primaSettimana) {
                // weekElems.forEach(w => w.classList.remove('selected'));
                primaSettimana.classList.add('selected');
              }
              mostraGiorniSelezionati();
            });
            containerMesi.appendChild(div);
          });
        }
        
        generaMesiDinamici(datiPuliti);

        // Aggiorna etichette settimane e mostra giorni iniziali
        const meseIniziale = document.querySelector('.calendar-month.selected').textContent;
        // aggiornaEtichetteSettimane(meseIniziale);
        generaSettimaneDinamiche(meseIniziale);
        const primaSettimana = document.querySelector('.calendar-week');
        if (primaSettimana) primaSettimana.classList.add('selected');
        mostraGiorniSelezionati();
      })
      .catch(err => console.error("Errore nel caricamento del Google Sheet:", err));

// ==================== Espansione dettagli licenze ====================
document.querySelectorAll('.licenza-row').forEach(row => {
  row.addEventListener('click', () => {
    const details = row.nextElementSibling;
    const isVisible = details.classList.contains('active');

    // Chiudi tutti gli altri
    document.querySelectorAll('.licenza-details.active').forEach(open => {
      open.style.maxHeight = null;
      open.classList.remove('active');
    });

    // Se non era già visibile, apri
    if (!isVisible) {
      details.classList.add('active');
      details.style.maxHeight = details.scrollHeight + 'px';
    }
  });
});
// ==================== Gestione visibilità container Free Download ====================
const downloadContainer = document.querySelector('.download-feedback');

function aggiornaDownloadFeedback() {
  if ((feedback.textContent && feedback.textContent.trim() !== '') || downloadBtn.style.display !== 'none') {
    downloadContainer.classList.add('active');
  } else {
    downloadContainer.classList.remove('active');
  }
}

// Aggiorna subito al caricamento
aggiornaDownloadFeedback();

// Modifica listener verificaCodiceBtn per aggiornare il container
verificaBtn.addEventListener('click', async function() {
    try {
        const password = codiceInput.value.replace(/"/g,'').trim();
        const d = document.getElementById('hx2f');
        const storedPwd = atob(d.dataset.b64pwd);
        const storedUrl = atob(d.dataset.b64url);

        feedback.textContent = 'Verifico...';
        feedback.style.color = '#333';
        aggiornaDownloadFeedback();

        if (password === storedPwd) {
            downloadBtn.href = storedUrl;
            downloadBtn.style.display = "inline-block";
            downloadBtn.setAttribute('target', '_blank');

            feedback.textContent = "Codice corretto! Scarica il beat qui sotto.";
            feedback.style.color = "#15af15";
        } else {
            downloadBtn.href = '';
            downloadBtn.style.display = "none";

            feedback.textContent = "Codice errato, riprova!";
            feedback.style.color = "#e74c3c";
        }
        aggiornaDownloadFeedback();
    } catch (err) {
        console.error('Errore nel listener verificaCodiceBtn:', err);
        feedback.textContent = "Si è verificato un errore. Riprova.";
        feedback.style.color = "#e74c3c";
        downloadBtn.style.display = "none";
        downloadBtn.href = '';
        aggiornaDownloadFeedback();
    }
});
// ==================== Gestione pulsante Prenota e form calendario ====================
const prenotaBtn = document.getElementById('prenotaBtn');
const warningEl = document.getElementById('calendar-warning');
const formContainer = document.getElementById('calendar-form-container');
const slotInput = document.getElementById('slotSelezionato');
const calendarForm = document.getElementById('calendarForm');

prenotaBtn.addEventListener('click', () => {
  // Controlla se c'è uno slot selezionato
  const selectedSlotEl = document.querySelector('li.selected-slot');
  if (!selectedSlotEl) {
    // Mostra messaggio di warning
    warningEl.style.display = 'block';
    formContainer.style.display = 'none';
  } else {
    // Nascondi warning
    warningEl.style.display = 'none';
    // Mostra form
    formContainer.style.display = 'block';
    // Popola campo slot selezionato
    const giornoColonna = selectedSlotEl.closest('.calendar-day-column').querySelector('div').textContent;
    slotInput.value = formattaSlotJS(giornoColonna, selectedSlotEl.textContent);

    // Aggiorna testo pulsante form in base allo stato dello slot
    const formSubmitBtn = calendarForm.querySelector('button[type="submit"]');
    if (selectedSlotEl.classList.contains('libero')) {
      formSubmitBtn.textContent = 'Conferma prenotazione';
    } else {
      formSubmitBtn.textContent = 'Richiedi disponibilità';
    }
  }
});

// Listener submit form
calendarForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = calendarForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '⏳';
  submitBtn.classList.add('loading');

  const formData = new URLSearchParams();
  formData.append('nome', calendarForm.nomeCognome.value);
  formData.append('contatto', calendarForm.email.value);
  formData.append('slot', slotInput.value);
  formData.append('emailUtente', calendarForm.emailUtente.value);

  // Invia comunque la richiesta fetch, ma non gestire la risposta
  fetch('https://script.google.com/macros/s/AKfycbyw2iM0ITis3mwU6i0-MmKV_HctoTQevyrJUVPdURki65F2aqH6p0b3RFtSIvSspuyY/exec', {
    method: 'POST',
    body: formData
  });

  // Mostra clessidra per 2 secondi, poi messaggio verde fisso
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');

    const successMsg = document.createElement('div');
    successMsg.textContent = `Prenotazione inviata con successo! Riceverai un messaggio di conferma al più presto.`;
    successMsg.style.color = '#15af15';
    successMsg.style.marginTop = '10px';
    successMsg.style.textAlign = 'center';
    prenotaBtn.insertAdjacentElement('afterend', successMsg);
    // Messaggio verde fisso (non viene rimosso)

    calendarForm.reset();
    formContainer.style.display = 'none';
    document.querySelectorAll('li.selected-slot').forEach(el => {
      el.classList.remove('selected-slot');
      el.style.background = el.classList.contains('libero') ? 'rgba(0, 200, 0, 0.12)' : 'rgba(200, 0, 0, 0.14)';
    });
    prenotaBtn.textContent = 'Prenota';
  }, 2000);
});

// Chiudi form se si clicca fuori dal container del calendario
document.addEventListener('click', function(e) {
  const calendarioContainer = document.querySelector('.calendar-section');
  if (calendarioContainer && !calendarioContainer.contains(e.target)) {
    formContainer.style.display = 'none';
    warningEl.style.display = 'none';
    document.querySelectorAll('li.selected-slot').forEach(el => {
      el.classList.remove('selected-slot');
      el.style.background = el.classList.contains('libero') ? 'rgba(0, 200, 0, 0.12)' : 'rgba(200, 0, 0, 0.14)';
    });
    prenotaBtn.textContent = 'Prenota';
  }
});
// Logica pulsante Contatti - WhatsApp
const whatsappBtn = document.querySelector('.contatto-whatsapp');
if (whatsappBtn) {
  whatsappBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const numero = '3468128888';
    const url = `https://wa.me/${numero}`;
    window.open(url, '_blank');
  });
}
// Logica pulsante Contatti - Instagram
const instagramBtn = document.querySelector('.contatto-instagram');
if (instagramBtn) {
  instagramBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = `https://www.instagram.com/`;
    window.open(url, '_blank');
  });
}

// Logica pulsante Contatti - YouTube
const youtubeBtn = document.querySelector('.contatto-youtube');
if (youtubeBtn) {
  youtubeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = `https://www.youtube.com/`;
    window.open(url, '_blank');
  });
}

// Logica pulsante Contatti - BeatStars
const beatstarsBtn = document.querySelector('.contatto-beatstars');
if (beatstarsBtn) {
  beatstarsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = `https://www.beatstars.com/itsmedg`;
    window.open(url, '_blank');
  });
}

// Logica pulsante Contatti - Maps
const mapsBtn = document.querySelector('.contatto-maps');
if (mapsBtn) {
  mapsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const indirizzo = 'Via Vittorio Veneto 54, Borgo San Dalmazzo';
    const indirizzoEncoded = encodeURIComponent(indirizzo);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android: apre scelta app di mappe
      window.location.href = `geo:0,0?q=${indirizzoEncoded}`;
    } else if (isIOS) {
      // iOS: apre Apple Maps
      window.location.href = `maps://?q=${indirizzoEncoded}`;
    } else {
      // Desktop: fallback Google Maps web
      const url = `https://www.google.com/maps/search/?api=1&query=${indirizzoEncoded}`;
      window.open(url, '_blank');
    }
  });
}