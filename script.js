(function(){

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

  var steps = ['introStep1','introStep2','introStep3','introStep4','introStep5'];
  var delays = [300, 2100, 4000, 5900, 7900];

  steps.forEach(function(id, i){
    setTimeout(function(){
      if(i > 0){
        document.getElementById(steps[i-1]).classList.remove('active');
      }
      document.getElementById(id).classList.add('active');
    }, delays[i]);
  });

  document.getElementById('introBtn').addEventListener('click', function(){
    var intro = document.getElementById('intro');
    intro.classList.add('closing');
    document.documentElement.classList.remove('intro-lock');
    setTimeout(function(){
      intro.style.display = 'none';
    }, 950);
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
    var count = 26;
    for(var i=0;i<count;i++){
      var piece = document.createElement('i');
      piece.style.left = (8 + Math.random()*84) + '%';
      piece.style.animationDelay = (Math.random()*0.7) + 's';
      piece.style.animationDuration = (2.1 + Math.random()*0.9) + 's';
      piece.style.transform = 'rotate(' + (Math.random()*40-20) + 'deg)';
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
    var bursts = [
      {x:22, y:32, delay:0},
      {x:74, y:22, delay:260},
      {x:50, y:44, delay:520}
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
