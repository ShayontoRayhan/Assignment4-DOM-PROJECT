const recipes = [
  {title:'Migas',desc:'Crumbled fried bread with spices and vegetables.',img:'https://picsum.photos/seed/migas/600/400'},
  {title:'Sushi',desc:'Rice rolls with fish or vegetables.',img:'https://picsum.photos/seed/sushi/600/400'},
  {title:'Borek',desc:'Savory pastry filled with cheese or meat.',img:'https://picsum.photos/seed/borek/600/400'},
  {title:'Corba',desc:'Warm spiced soup popular in many cuisines.',img:'https://picsum.photos/seed/corba/600/400'},
  {title:'Kumpir',desc:'Loaded baked potato with varied toppings.',img:'https://picsum.photos/seed/kumpir/600/400'},
  {title:'Tamiya',desc:'Crispy fried chickpea patties (falafel).',img:'https://picsum.photos/seed/tamiya/600/400'},
  {title:'Bistek',desc:'Pan-seared beef steak with seasoning.',img:'https://picsum.photos/seed/bistek/600/400'},
  {title:'Wontons',desc:'Dumplings filled with meat or vegetables.',img:'https://picsum.photos/seed/wontons/600/400'},
  {title:'Kofta',desc:'Spiced meatballs served with sauce.',img:'https://picsum.photos/seed/kofta/600/400'},
  {title:'Big Mac',desc:'Classic double-patty burger with sauce.',img:'https://picsum.photos/seed/bigmac/600/400'},
  {title:'Lasagne',desc:'Layered pasta with meat, cheese and sauce.',img:'https://picsum.photos/seed/lasagne/600/400'},
  {title:'Timbits',desc:'Small fried dough treats.',img:'https://picsum.photos/seed/timbits/600/400'},
  {title:'Dal Fry',desc:'Spiced lentils stir-fried with aromatics.',img:'https://picsum.photos/seed/dalfry/600/400'},
  {title:'Poutine',desc:'Fries topped with gravy and cheese curds.',img:'https://picsum.photos/seed/poutine/600/400'},
  {title:'Pancakes',desc:'Fluffy stacked pancakes with syrup.',img:'https://picsum.photos/seed/pancakes/600/400'},
  {title:'Shawarma',desc:'Thinly sliced seasoned meat wrap.',img:'https://picsum.photos/seed/shawarma/600/400'},
  {title:'Moussaka',desc:'Eggplant and meat baked casserole.',img:'https://picsum.photos/seed/moussaka/600/400'},
  {title:'Fish pie',desc:'Creamy fish filling topped with pastry.',img:'https://picsum.photos/seed/fishpie/600/400'},
  {title:'Kedgeree',desc:'Smoked fish and rice breakfast dish.',img:'https://picsum.photos/seed/kedgeree/600/400'},
  {title:'Roti John',desc:'Egg and meat sandwich popular in SE Asia.',img:'https://picsum.photos/seed/rotijohn/600/400'}
];

// Optional API URL - set to your endpoint. If empty, the app uses local `recipes` fallback.
const API_URL = '';

// Local images available in the project folder (used when API_URL is empty)
const localImages = ['card.jpg','page-title.jpg','logo.png'];

const el = id => document.getElementById(id);
const recipesWrap = el('recipes');
const searchInput = el('search');
const clearBtn = el('clear');
const modal = el('modal');
const modalImg = el('modalImg');
const modalTitle = el('modalTitle');
const modalDesc = el('modalDesc');
const modalClose = el('modalClose');

let allRecipes = recipes.slice(); // will be replaced by fetched data when available

function createCard(r){
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <img src="${r.img}" alt="${r.title}" />
    <div class="card-body">
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <div class="actions">
        <span class="chip">  </span>
        <button class="btn" data-title="${r.title}">View Details</button>
      </div>
    </div>
  `;
  const btn = card.querySelector('.btn');
  btn.addEventListener('click', ()=>openModal(r));
  return card;
}

function render(list){
  recipesWrap.innerHTML = '';
  if(!list || !list.length){
    recipesWrap.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666">No recipes found.</p>';
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach(r=>frag.appendChild(createCard(r)));
  recipesWrap.appendChild(frag);
}

// show skeleton loading cards while fetching data
function showLoading(count = 6){
  recipesWrap.innerHTML = '';
  const frag = document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const s = document.createElement('article');
    s.className = 'card skeleton';
    s.innerHTML = `<div class="s-img"></div><div class="s-body"><div class="s-line" style="width:70%"></div><div class="s-line" style="width:90%"></div><div class="s-line" style="width:50%"></div></div>`;
    frag.appendChild(s);
  }
  recipesWrap.appendChild(frag);
}

function normalize(s){return String(s||'').trim().toLowerCase();}

searchInput.addEventListener('input', e=>{
  const q = normalize(e.target.value);
  if(!q) return render(allRecipes);
  const filtered = allRecipes.filter(r=>normalize(r.title).includes(q) || normalize(r.desc).includes(q));
  render(filtered);
});

clearBtn.addEventListener('click', ()=>{searchInput.value='';render(allRecipes);searchInput.focus();});

function openModal(r){
  modalImg.src = r.img;
  modalTitle.textContent = r.title;
  modalDesc.textContent = r.desc + ' — This is a sample description. You can extend each recipe with ingredients and steps.';
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  modal.setAttribute('aria-hidden','true');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });

async function fetchRecipes(){
  if(!API_URL) return recipes;
  try{
    const res = await fetch(API_URL, {cache:'no-store'});
    if(!res.ok) throw new Error('Bad response ' + res.status);
    const data = await res.json();
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.recipes)) return data.recipes;
    return recipes;
  }catch(err){
    console.warn('Failed to fetch recipes, using local fallback.', err);
    return recipes;
  }
}

(async function init(){
  // show loading skeleton while fetching
  showLoading(8);
  setHeroLoading(true);
  allRecipes = await fetchRecipes();
  if(!API_URL){
    allRecipes = allRecipes.map((r,i)=>({
      ...r,
      img: localImages[i % localImages.length]
    }));
  }
  render(allRecipes);
  // If using local images, show per-card skeletons then load updated images after 2s
  if(!API_URL){
    replaceImagesWithSkeletonThenReload(2000);
  }
  setHeroLoading(false);
})();

// Replace each card's image area with a skeleton, then after `delay` ms swap in updated local images
function replaceImagesWithSkeletonThenReload(delay = 2000){
  const cards = Array.from(recipesWrap.querySelectorAll('.card'));
  if(!cards.length) return;
  const originals = cards.map(c => c.innerHTML);
  // replace each card content with skeleton (no image, no details shown)
  // show grid-level spinner overlay
  setGridLoading(true);
  cards.forEach(card => {
    card.innerHTML = `<div class="s-img"></div><div class="s-body"><div class="s-line" style="width:70%"></div><div class="s-line" style="width:90%"></div><div class="s-line" style="width:50%"></div></div>`;
  });

  setTimeout(()=>{
    cards.forEach((card, i) =>{
      // restore original content
      card.innerHTML = originals[i] || '';
      // update image to rotated local image (cache-busted)
      const img = card.querySelector('img');
      if(img){
        img.src = localImages[(i+1) % localImages.length] + '?v=' + Date.now();
      }
      // reattach button handler to open modal using the correct recipe data
      const btn = card.querySelector('.btn');
      if(btn){
        // remove existing listeners by cloning node
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', ()=>openModal(allRecipes[i]));
      }
    });
    // hide grid-level spinner overlay when done
    setGridLoading(false);
  }, delay);
}

// Toggle grid-level spinner overlay
function setGridLoading(loading){
  const gs = el('gridSpinner');
  if(!gs) return;
  gs.setAttribute('aria-hidden', loading ? 'false' : 'true');
}

// Toggle hero spinner visibility
function setHeroLoading(loading){
  const hs = el('heroSpinner');
  if(!hs) return;
  hs.setAttribute('aria-hidden', loading ? 'false' : 'true');
}
