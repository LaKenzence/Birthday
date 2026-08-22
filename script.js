(function(){

  /* Party mode toggle: pause/resume confetti + balloons */
  var partyOff = false;
  try {
    partyOff = window.localStorage.getItem('partyMode') === 'off';
  } catch(e){}

  function applyPartyState(){
    document.documentElement.classList.toggle('party-off', partyOff);
    var toggle = document.getElementById('partyToggle');
    var icon = document.getElementById('partyToggleIcon');
    var label = document.getElementById('partyToggleLabel');
    if(toggle) toggle.setAttribute('aria-pressed', partyOff ? 'true' : 'false');
    if(icon) icon.textContent = partyOff ? '🔕' : '🎉';
    if(label) label.textContent = partyOff ? 'Reprendre' : 'Pause';
  }

  applyPartyState();

  /* Birthday song: starts on first interaction, tied to the party toggle */
  var birthdaySong = document.getElementById('birthdaySong');

  function playSong(){
    if(!birthdaySong || partyOff) return;
    birthdaySong.volume = 0.55;
    var p = birthdaySong.play();
    if(p && typeof p.catch === 'function'){ p.catch(function(){}); }
  }

  function pauseSong(){
    if(!birthdaySong) return;
    birthdaySong.pause();
  }

  var partyToggleBtn = document.getElementById('partyToggle');
  if(partyToggleBtn){
    partyToggleBtn.addEventListener('click', function(){
      partyOff = !partyOff;
      try { window.localStorage.setItem('partyMode', partyOff ? 'off' : 'on'); } catch(e){}
      applyPartyState();
      if(partyOff){
        pauseSong();
      } else {
        playSong();
      }
    });
  }

  /* Confetti+heart cannon: click anywhere to make it pop */
  function spawnClickBurst(x, y){
    if(partyOff) return;
    var burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    document.body.appendChild(burst);
    var n = 12;
    for(var i=0;i<n;i++){
      var p = document.createElement('i');
      var angle = Math.random() * 360;
      var dist = 30 + Math.random() * 46;
      var rad = angle * Math.PI / 180;
      var dx = Math.cos(rad) * dist;
      var dy = Math.sin(rad) * dist;
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.animationDelay = (Math.random() * 0.1) + 's';
      if(i % 3 === 0){
        p.classList.add('heart-piece');
        p.textContent = '❤';
      }
      burst.appendChild(p);
    }
    setTimeout(function(){ burst.remove(); }, 900);
  }

  document.addEventListener('click', function(e){
    var target = e.target;
    if(target.closest('button, a, input, textarea, .party-toggle, .cake-candle, img, .photo-lightbox, .wax-seal')) return;
    spawnClickBurst(e.clientX, e.clientY);
  });

  /* Soft cursor trail of hearts/sparkles on desktop */
  var lastTrailTime = 0;
  document.addEventListener('mousemove', function(e){
    if(partyOff || reduceMotionGlobal) return;
    var now = Date.now();
    if(now - lastTrailTime < 100) return;
    lastTrailTime = now;
    var s = document.createElement('span');
    s.className = 'cursor-spark';
    s.textContent = Math.random() < 0.5 ? '❤' : '✦';
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);
    setTimeout(function(){ s.remove(); }, 900);
  });

  /* Wax seal: click to crack it open and reveal the hidden P.S. */
  var waxSeal = document.getElementById('waxSeal');
  var waxSecret = document.getElementById('waxSecret');
  var waxSealHint = document.getElementById('waxSealHint');
  if(waxSeal && waxSecret){
    waxSeal.addEventListener('click', function(e){
      e.stopPropagation();
      if(waxSeal.classList.contains('cracked')) return;
      waxSeal.classList.add('cracked');
      waxSeal.setAttribute('aria-expanded', 'true');
      if(waxSealHint) waxSealHint.classList.add('hidden');
      waxSecret.classList.add('open');
      var rect = waxSeal.getBoundingClientRect();
      spawnClickBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }

  /* Live counter styled like a flight-duration readout on the boarding pass */
  var liveCounterEl = document.getElementById('liveCounter');
  var BIRTHDAY_TARGET = new Date(2026, 7, 23, 0, 0, 0);

  function padNum(n){ return n < 10 ? '0' + n : String(n); }

  function updateLiveCounter(){
    if(!liveCounterEl) return;
    var now = new Date();
    var diff = now - BIRTHDAY_TARGET;
    var future = diff < 0;
    var abs = Math.abs(diff);
    var totalSeconds = Math.floor(abs / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    var timeStr = days + 'd ' + padNum(hours) + ':' + padNum(minutes) + ':' + padNum(seconds);
    liveCounterEl.textContent = future
      ? 'FLIGHT 23 · BOARDING IN ' + timeStr
      : 'FLIGHT 23 · IN PROGRESS FOR ' + timeStr;
  }

  updateLiveCounter();
  setInterval(updateLiveCounter, 1000);

  /* Click any real photo to open it full-screen in a polaroid. */
  var photoLightbox = document.getElementById('photoLightbox');
  var photoLightboxImage = document.getElementById('photoLightboxImage');
  var photoLightboxCaption = document.getElementById('photoLightboxCaption');
  var photoLightboxClose = document.getElementById('photoLightboxClose');

  function openPhoto(img){
    if(!img || !img.src) return;
    photoLightboxImage.src = img.currentSrc || img.src;
    photoLightboxImage.alt = img.alt || 'Memory';

    var parent = img.closest('.photo-slot, .letter-photo');
    var label = parent ? parent.querySelector('span, label') : null;
    photoLightboxCaption.textContent = (img.dataset.caption || (label ? label.textContent : '')).trim();

    photoLightbox.classList.add('active');
    photoLightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closePhoto(){
    photoLightbox.classList.remove('active');
    photoLightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    setTimeout(function(){ photoLightboxImage.src = ''; }, 300);
  }

  document.querySelectorAll('.letter-photo img, .photo-slot img').forEach(function(img){
    img.addEventListener('click', function(e){
      e.stopPropagation();
      openPhoto(img);
    });
  });

  photoLightboxClose.addEventListener('click', closePhoto);
  photoLightbox.addEventListener('click', function(e){
    if(e.target === photoLightbox) closePhoto();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && photoLightbox.classList.contains('active')) closePhoto();
  });

  document.documentElement.classList.add('intro-lock');

  /* Ambient confetti rain across the whole page */
  var ambientConfetti = document.getElementById('ambientConfetti');
  var reduceMotionGlobal = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(ambientConfetti && !reduceMotionGlobal && !partyOff){
    var ambientCount = 24;
    for(var a=0; a<ambientCount; a++){
      var ap = document.createElement('i');
      ap.style.left = (Math.random()*100) + '%';
      ap.style.animationDuration = (9 + Math.random()*7) + 's';
      ap.style.animationDelay = (Math.random()*14) + 's';
      if(a % 5 === 0){
        ap.classList.add('heart-piece');
        ap.textContent = '❤';
      }
      ambientConfetti.appendChild(ap);
    }
  }

  /* Coeurs qui montent en continu, en plus des confettis */
  var floatingHearts = document.getElementById('floatingHearts');
  if(floatingHearts && !reduceMotionGlobal && !partyOff){
    var heartCount = 12;
    var heartChars = ['❤','♥'];
    for(var hh=0; hh<heartCount; hh++){
      var hp = document.createElement('span');
      hp.textContent = heartChars[hh % 2];
      hp.style.left = (Math.random()*100) + '%';
      hp.style.animationDuration = (10 + Math.random()*8) + 's';
      hp.style.animationDelay = (Math.random()*16) + 's';
      floatingHearts.appendChild(hp);
    }
  }

  /* Generic section-confetti activator: adds .active to any section
     with a .section-confetti child once it enters the viewport */
  var confettiSections = document.querySelectorAll('.mapsection, .gifts-section, .archive, .history');
  if('IntersectionObserver' in window){
    var sectionConfettiObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('active');
          sectionConfettiObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.35});
    confettiSections.forEach(function(sec){ sectionConfettiObserver.observe(sec); });
  } else {
    confettiSections.forEach(function(sec){ sec.classList.add('active'); });
  }

  var steps = ['introStep1','introStep2','introStep3','introStep3b','introStep4'];
  var delays = [300, 2100, 4000, 5700, 7300];
  var introProgressDots = document.querySelectorAll('#introProgress .dot');
  var introPlaneFly = document.getElementById('introPlaneFly');

  steps.forEach(function(id, i){
    setTimeout(function(){
      if(i > 0){
        document.getElementById(steps[i-1]).classList.remove('active');
      }
      document.getElementById(id).classList.add('active');
      if(id === 'introStep2' && introPlaneFly){
        introPlaneFly.classList.add('flying');
      }
      if(introProgressDots.length){
        introProgressDots.forEach(function(d){ d.classList.remove('active'); });
        if(introProgressDots[i]) introProgressDots[i].classList.add('active');
      }
    }, delays[i]);
  });

  var welcomeBurst = document.getElementById('welcomeBurst');

  function spawnWelcomeBurst(){
    if(!welcomeBurst || partyOff) return;
    var count = 60;
    for(var i=0;i<count;i++){
      var piece = document.createElement('i');
      piece.style.left = (Math.random()*100) + '%';
      piece.style.animationDelay = (Math.random()*0.6) + 's';
      piece.style.animationDuration = (2.4 + Math.random()*1.2) + 's';
      if(i % 6 === 0){
        piece.classList.add('heart-piece');
        piece.textContent = '❤';
        piece.style.fontSize = (11 + Math.random()*6) + 'px';
      }
      welcomeBurst.appendChild(piece);
    }
    setTimeout(function(){
      welcomeBurst.innerHTML = '';
    }, 4200);
  }

  /* ---- Takeoff effect: plays when the boarding-pass button is clicked ---- */
  var takeoffFx = document.getElementById('takeoffFx');
  var speedlinesBox = document.getElementById('takeoffSpeedlines');

  function buildSpeedLines(){
    if(!speedlinesBox) return;
    speedlinesBox.innerHTML = '';
    var n = 18;
    for(var i=0;i<n;i++){
      var line = document.createElement('span');
      var angle = Math.random()*360;
      var radius = 20 + Math.random()*20;
      line.style.transform = 'translate(-50%,-50%) rotate(' + angle + 'deg) translateX(' + radius + '%)';
      line.style.animationDelay = (Math.random()*0.3) + 's';
      speedlinesBox.appendChild(line);
    }
  }

  document.getElementById('introBtn').addEventListener('click', function(){
    var intro = document.getElementById('intro');

    buildSpeedLines();
    intro.classList.add('taking-off');
    playSong();

    setTimeout(function(){
      intro.classList.add('closing');
      document.documentElement.classList.remove('intro-lock');
      spawnWelcomeBurst();
      setTimeout(function(){
        intro.style.display = 'none';
      }, 950);
    }, 1150);
  });

  var mapCard = document.getElementById('mapCard');
  var routePath = document.getElementById('routePath');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawRoute(){
    if(!routePath) return;
    if(reduceMotion){
      routePath.style.strokeDasharray = 'none';
      routePath.style.strokeDashoffset = '0';
      return;
    }
    var len = routePath.getTotalLength();
    routePath.style.strokeDasharray = len;
    routePath.style.strokeDashoffset = len;
    requestAnimationFrame(function(){
      routePath.style.transition = 'stroke-dashoffset 3.2s ease-in-out';
      routePath.style.strokeDashoffset = 0;
    });
  }

  function activateMap(){
    mapCard.classList.add('active');
    drawRoute();
  }

  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          activateMap();
          observer.disconnect();
        }
      });
    }, {threshold:.5});
    observer.observe(mapCard);
  } else {
    activateMap();
  }

  var ticket = document.getElementById('ticket');
  if('IntersectionObserver' in window){
    var ticketObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          ticket.classList.add('active');
          ticketObserver.disconnect();
        }
      });
    }, {threshold:.5});
    ticketObserver.observe(ticket);
  } else {
    ticket.classList.add('active');
  }

  /* Blow-out birthday candle on the cover */
  var coverCandle = document.getElementById('coverCandle');
  var coverConfetti = document.getElementById('coverConfetti');
  var coverHint = document.getElementById('coverHint');

  function spawnCoverConfettiBurst(){
    if(!coverConfetti || partyOff) return;
    coverConfetti.innerHTML = '';
    var count = 22;
    for(var i=0;i<count;i++){
      var piece = document.createElement('i');
      piece.style.left = (5 + Math.random()*90) + '%';
      piece.style.animationDelay = (Math.random()*0.4) + 's';
      piece.style.animationDuration = (1.8 + Math.random()*0.8) + 's';
      if(i % 5 === 0){
        piece.classList.add('heart-piece');
        piece.textContent = '❤';
      }
      coverConfetti.appendChild(piece);
    }
  }

  if(coverCandle){
    coverCandle.addEventListener('click', function(){
      if(coverCandle.classList.contains('blown')) return;
      coverCandle.classList.add('blown');
      if(coverHint) coverHint.style.display = 'none';
      spawnCoverConfettiBurst();
      setTimeout(function(){
        if(coverConfetti) coverConfetti.innerHTML = '';
      }, 2600);
    });
  }

  var postal = document.getElementById('postal');
  if('IntersectionObserver' in window){
    var postalObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          postal.classList.add('active');
          postalObserver.disconnect();
        }
      });
    }, {threshold:.5});
    postalObserver.observe(postal);
  } else {
    postal.classList.add('active');
  }

  var finalSection = document.getElementById('final');
  var confettiBox = document.getElementById('confetti');
  var fireworksBox = document.getElementById('fireworks');
  var fireworkColors = ['#c5a35a','#f6f0e4','#c7473b'];

  function spawnConfetti(){
    if(partyOff) return;
    var count = 46;
    for(var i=0;i<count;i++){
      var piece = document.createElement('i');
      piece.style.left = (8 + Math.random()*84) + '%';
      piece.style.animationDelay = (Math.random()*0.7) + 's';
      piece.style.animationDuration = (2.1 + Math.random()*0.9) + 's';
      piece.style.transform = 'rotate(' + (Math.random()*40-20) + 'deg)';
      if(i % 6 === 0){
        piece.classList.add('heart-piece');
        piece.textContent = '❤';
        piece.style.fontSize = (12 + Math.random()*6) + 'px';
      }
      confettiBox.appendChild(piece);
    }
  }

  function spawnFireworkBurst(xPct, yPct){
    var particles = 16;
    var color = fireworkColors[Math.floor(Math.random()*fireworkColors.length)];
    for(var i=0;i<particles;i++){
      var angle = (360 / particles) * i + (Math.random()*14 - 7);
      var dist = 46 + Math.random()*34;
      var rad = angle * Math.PI / 180;
      var dx = Math.cos(rad) * dist;
      var dy = Math.sin(rad) * dist;
      var p = document.createElement('i');
      p.style.left = xPct + '%';
      p.style.top = yPct + '%';
      p.style.color = color;
      p.style.background = color;
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.animationDelay = (Math.random()*0.12) + 's';
      fireworksBox.appendChild(p);
    }
  }

function spawnFireworks(){
    if(partyOff) return;
    var bursts = [
      {x:22, y:32, delay:0},
      {x:74, y:22, delay:200},
      {x:50, y:44, delay:400},
      {x:30, y:60, delay:650},
      {x:80, y:50, delay:850},
      {x:15, y:70, delay:1100},
      {x:60, y:20, delay:1300},
      {x:90, y:65, delay:1550},
      {x:40, y:78, delay:1800}
    ];
    bursts.forEach(function(b){
      setTimeout(function(){ spawnFireworkBurst(b.x, b.y); }, b.delay);
    });
  }

  if('IntersectionObserver' in window){
    var finalObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          finalSection.classList.add('active');
          setTimeout(spawnConfetti, 3200);
          setTimeout(spawnFireworks, 3200);
          finalObserver.disconnect();
        }
      });
    }, {threshold:.4});
    finalObserver.observe(finalSection);
  } else {
    finalSection.classList.add('active');
    spawnConfetti();
    spawnFireworks();
  }
})();
