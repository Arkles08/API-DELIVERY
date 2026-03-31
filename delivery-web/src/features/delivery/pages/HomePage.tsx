import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore } from '../../../features/auth/store/auth.store';
import { useDeliveryDashboard } from '../hooks/useDeliveryDashboard';
import type { OrderStatus } from '../types/delivery.types';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { useFinanceStore } from '../../../stores/finance.store';
import styles from './HomePage.module.css';

type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix';
type DashboardTab = 'home' | 'restaurants' | 'tracking' | 'admin';

type PromotionCard = {
  id: string;
  title: string;
  description: string;
  discount: string;
  tag: string;
  restaurantName: string;
  restaurantDescription: string;
  cuisineFilter: string;
};

type MenuPreviewItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  badge: string;
};

type RestaurantMenuOption = {
  name: string;
  description: string;
  cuisine: string;
  emoji: string;
  accent: string;
  frame: string;
  signatureDish: string;
  eta: string;
  note: string;
};

const restaurantMenuOptions: RestaurantMenuOption[] = [
  {
    name: 'Cantina Aurora',
    description: 'Massas artesanais, pizzas de longa fermentação e delivery noturno.',
    cuisine: 'Massas',
    emoji: '🍝',
    accent: '#ffb347',
    frame: 'Aurora italiana',
    signatureDish: 'Forno a lenha',
    eta: '25-35 min',
    note: 'Cardápio quente e forno ativo.',
  },
  {
    name: 'Brasa do Porto',
    description: 'Hambúrgueres artesanais, grelhados e combos premium para entrega rápida.',
    cuisine: 'Lanches',
    emoji: '🍔',
    accent: '#ff7b54',
    frame: 'Brasa urbana',
    signatureDish: 'Blend na chapa',
    eta: '20-30 min',
    note: 'Chapa aberta e montagem expressa.',
  },
  {
    name: 'Kado Sushi Bar',
    description: 'Comida japonesa, combinados e temakis preparados na hora.',
    cuisine: 'Japonês',
    emoji: '🍣',
    accent: '#5cc8ff',
    frame: 'Noite de omakase',
    signatureDish: 'Peixe fresco',
    eta: '30-40 min',
    note: 'Preparação leve com corte na hora.',
  },
  {
    name: 'Sabor da Vila',
    description: 'Comida brasileira de panela, pratos executivos e porções para família.',
    cuisine: 'Comida caseira',
    emoji: '🍛',
    accent: '#88c46a',
    frame: 'Casa cheia',
    signatureDish: 'Temperos da casa',
    eta: '18-28 min',
    note: 'Prato do dia com saída rápida.',
  },
  {
    name: 'Feijao de Corda do Norte',
    description: 'Especializado em feijao de corda, carne de sol e acompanhamentos regionais.',
    cuisine: 'Nordestina',
    emoji: '🥘',
    accent: '#d29b52',
    frame: 'Sabor regional',
    signatureDish: 'Carne de sol na manteiga',
    eta: '30-40 min',
    note: 'Panelas em fogo continuo.',
  },
  {
    name: 'Rancho do Churrasco',
    description: 'Cortes grelhados, espetinhos e porcoes para dividir.',
    cuisine: 'Churrasco',
    emoji: '🥩',
    accent: '#c96b3a',
    frame: 'Brasa forte',
    signatureDish: 'Picanha fatiada',
    eta: '28-38 min',
    note: 'Grelha premium em alta.',
  },
  {
    name: 'Japa Nobre Express',
    description: 'Combinados japoneses, poke e sashimis frescos.',
    cuisine: 'Japones',
    emoji: '🍱',
    accent: '#4ea6d8',
    frame: 'Corte fino',
    signatureDish: 'Combinado 32 pecas',
    eta: '25-35 min',
    note: 'Montagem sob demanda.',
  },
  {
    name: 'Lanche Supremo',
    description: 'Smash burgers, batata frita crocante e molhos artesanais.',
    cuisine: 'Lanches',
    emoji: '🍟',
    accent: '#f08f44',
    frame: 'Noite de burger',
    signatureDish: 'Smash duplo cheddar',
    eta: '18-28 min',
    note: 'Linha de montagem rapida.',
  },
  {
    name: 'Panela Brasileira',
    description: 'Pratos executivos de comida caseira com tempero tradicional.',
    cuisine: 'Caseira',
    emoji: '🍲',
    accent: '#8db45a',
    frame: 'Almoco da casa',
    signatureDish: 'Frango ensopado',
    eta: '20-30 min',
    note: 'Cardapio rotativo diario.',
  },
  {
    name: 'Masseria Italiana',
    description: 'Massas recheadas, risotos e pratos italianos especiais.',
    cuisine: 'Italiana',
    emoji: '🍝',
    accent: '#d88452',
    frame: 'Cantina premium',
    signatureDish: 'Ravioli de ricota',
    eta: '26-36 min',
    note: 'Molhos finalizados na hora.',
  },
  {
    name: 'Tempero da Bahia',
    description: 'Acaraje, moqueca e pratos baianos com sabor marcante.',
    cuisine: 'Baiana',
    emoji: '🫕',
    accent: '#e3a049',
    frame: 'Costa brasileira',
    signatureDish: 'Moqueca de peixe',
    eta: '30-45 min',
    note: 'Cozinha de frutos do mar.',
  },
  {
    name: 'Casa do Pastel 24h',
    description: 'Pasteis recheados, caldo de cana e combos economicos.',
    cuisine: 'Lanches',
    emoji: '🥟',
    accent: '#e9b357',
    frame: 'Feira urbana',
    signatureDish: 'Pastel especial',
    eta: '15-22 min',
    note: 'Fritura em fluxo continuo.',
  },
  {
    name: 'Forno Mineiro',
    description: 'Comida mineira, tropeiro, frango com quiabo e sobremesas.',
    cuisine: 'Mineira',
    emoji: '🍛',
    accent: '#9e8757',
    frame: 'Sabor de interior',
    signatureDish: 'Feijao tropeiro',
    eta: '24-34 min',
    note: 'Pratos robustos e fartos.',
  },
  {
    name: 'Sushi da Esquina',
    description: 'Temakis, hots e combinados para o dia a dia.',
    cuisine: 'Japones',
    emoji: '🍣',
    accent: '#62b4e2',
    frame: 'Japa rapido',
    signatureDish: 'Temaki salmao',
    eta: '22-32 min',
    note: 'Opcao leve para jantar.',
  },
  {
    name: 'Ponto do Frango Assado',
    description: 'Frango assado, farofa, arroz e acompanhamentos familiares.',
    cuisine: 'Brasileira',
    emoji: '🍗',
    accent: '#c77944',
    frame: 'Rotisserie',
    signatureDish: 'Frango completo',
    eta: '25-35 min',
    note: 'Ideal para refeicao em grupo.',
  },
  {
    name: 'Burguer do Centro',
    description: 'Burgers artesanais, onion rings e sobremesas geladas.',
    cuisine: 'Lanches',
    emoji: '🍔',
    accent: '#ff8a52',
    frame: 'Centro urbano',
    signatureDish: 'Burger bacon crispy',
    eta: '18-26 min',
    note: 'Alto giro no jantar.',
  },
  {
    name: 'Nippon Delivery House',
    description: 'Sushis premium, sashimis e pratos quentes orientais.',
    cuisine: 'Japones',
    emoji: '🥢',
    accent: '#66a9d0',
    frame: 'Omakase rapido',
    signatureDish: 'Barca especial',
    eta: '28-38 min',
    note: 'Equipe especializada em cortes.',
  },
  {
    name: 'Costela e Cia',
    description: 'Costela assada, arroz biro-biro e porcoes especiais.',
    cuisine: 'Churrasco',
    emoji: '🍖',
    accent: '#b8673c',
    frame: 'Brasa lenta',
    signatureDish: 'Costela desfiada',
    eta: '30-45 min',
    note: 'Carnes de longa coccao.',
  },
  {
    name: 'Panelinha Gourmet',
    description: 'Pratos executivos gourmet com ingredientes selecionados.',
    cuisine: 'Contemporanea',
    emoji: '🍽️',
    accent: '#7ca780',
    frame: 'Menu chef',
    signatureDish: 'Risoto de cogumelos',
    eta: '24-34 min',
    note: 'Proposta premium diaria.',
  },
  {
    name: 'Sabor do Sertao',
    description: 'Buchada, baião e receitas tipicas do sertao nordestino.',
    cuisine: 'Nordestina',
    emoji: '🌵',
    accent: '#c89b59',
    frame: 'Raizes nordestinas',
    signatureDish: 'Baião completo',
    eta: '27-37 min',
    note: 'Receitas de familia.',
  },
  {
    name: 'Taco & Grill',
    description: 'Tacos, burritos e grelhados com toque mexicano.',
    cuisine: 'Mexicana',
    emoji: '🌮',
    accent: '#d37a47',
    frame: 'Fiesta express',
    signatureDish: 'Combo taco duplo',
    eta: '20-30 min',
    note: 'Picancia sob medida.',
  },
  {
    name: 'Bistro do Arroz',
    description: 'Arroz de forno, paellas e receitas com frutos do mar.',
    cuisine: 'Bistro',
    emoji: '🥘',
    accent: '#a58a5f',
    frame: 'Arroz autoral',
    signatureDish: 'Paella do mar',
    eta: '30-40 min',
    note: 'Pratos para compartilhar.',
  },
  {
    name: 'Esquina do Shawarma',
    description: 'Shawarmas, esfihas abertas e pratos arabes completos.',
    cuisine: 'Arabe',
    emoji: '🥙',
    accent: '#b9794f',
    frame: 'Street arabic',
    signatureDish: 'Shawarma de frango',
    eta: '19-29 min',
    note: 'Massa fresca diariamente.',
  },
];

const promotionCards: PromotionCard[] = [
  {
    id: 'promo-1',
    title: 'Combo da Noite',
    description: 'Brasa do Porto com burger duplo + batata grande + refrigerante com desconto especial.',
    discount: '30% OFF',
    tag: 'Mais pedido',
    restaurantName: 'Brasa do Porto',
    restaurantDescription: 'Hambúrgueres artesanais, grelhados e combos premium para entrega rápida.',
    cuisineFilter: 'Lanches',
  },
  {
    id: 'promo-2',
    title: 'Festival Japones',
    description: 'Kado Sushi Bar com combinados selecionados e frete reduzido para pedidos acima de R$ 70.',
    discount: 'Frete -50%',
    tag: 'Japa',
    restaurantName: 'Kado Sushi Bar',
    restaurantDescription: 'Comida japonesa, combinados e temakis preparados na hora.',
    cuisineFilter: 'Japonês',
  },
  {
    id: 'promo-3',
    title: 'Almoco Executivo',
    description: 'Sabor da Vila com pratos caseiros e bebida inclusa em horario comercial.',
    discount: 'R$ 12 OFF',
    tag: 'Caseiro',
    restaurantName: 'Sabor da Vila',
    restaurantDescription: 'Comida brasileira de panela, pratos executivos e porções para família.',
    cuisineFilter: 'Comida caseira',
  },
  {
    id: 'promo-4',
    title: 'Sertao em Dobro',
    description: 'Sabor do Sertao: na compra de baião completo, leve uma porcao de acompanhamento.',
    discount: '2 por 1',
    tag: 'Nordestino',
    restaurantName: 'Sabor do Sertao',
    restaurantDescription: 'Buchada, baião e receitas tipicas do sertao nordestino.',
    cuisineFilter: 'Comida caseira',
  },
];

const restaurantShowcaseCatalog: Record<string, MenuPreviewItem[]> = {
  'Cantina Aurora': [
    {
      id: 'cantina-aurora-1',
      name: 'Pizza Margherita',
      description: 'Molho de tomate, muçarela, parmesão e manjericão fresco.',
      price: '42.90',
      badge: 'Mais pedido',
    },
    {
      id: 'cantina-aurora-2',
      name: 'Lasanha da Casa',
      description: 'Massa fresca, ragù bovino e molho bechamel.',
      price: '49.50',
      badge: 'Clássico',
    },
    {
      id: 'cantina-aurora-3',
      name: 'Fettuccine Alfredo',
      description: 'Molho cremoso, parmesão e frango grelhado em tiras.',
      price: '46.90',
      badge: 'Sugestão',
    },
  ],
  'Brasa do Porto': [
    {
      id: 'brasa-porto-1',
      name: 'Burger Brasa Classic',
      description: 'Blend angus, cheddar, cebola caramelizada e batatas rústicas.',
      price: '38.90',
      badge: 'Mais pedido',
    },
    {
      id: 'brasa-porto-2',
      name: 'Combo Duo Grill',
      description: 'Dois smash burgers, molho da casa e refrigerante 600 ml.',
      price: '61.80',
      badge: 'Combo',
    },
    {
      id: 'brasa-porto-3',
      name: 'Costela BBQ',
      description: 'Costela desfiada, molho barbecue, salada coleslaw e pão brioche.',
      price: '54.90',
      badge: 'Premium',
    },
  ],
  'Kado Sushi Bar': [
    {
      id: 'kado-1',
      name: 'Combinado Kado 24 peças',
      description: 'Sashimis, hot rolls, niguiris e uramakis selecionados.',
      price: '79.90',
      badge: 'Mais pedido',
    },
    {
      id: 'kado-2',
      name: 'Temaki Salmão Premium',
      description: 'Salmão fresco, cream cheese e cebolinha na alga crocante.',
      price: '31.90',
      badge: 'Leve',
    },
    {
      id: 'kado-3',
      name: 'Hot Roll Especial',
      description: 'Cream cheese, salmão empanado, tarê e gergelim tostado.',
      price: '28.90',
      badge: 'Sugestão',
    },
  ],
  'Sabor da Vila': [
    {
      id: 'sabor-1',
      name: 'PF Executivo de Frango',
      description: 'Arroz, feijão, frango grelhado, salada e farofa crocante.',
      price: '34.90',
      badge: 'Mais pedido',
    },
    {
      id: 'sabor-2',
      name: 'Baião da Casa',
      description: 'Arroz, feijão-de-corda, carne de sol, queijo coalho e vinagrete.',
      price: '39.50',
      badge: 'Regional',
    },
    {
      id: 'sabor-3',
      name: 'Parmegiana da Vila',
      description: 'Bife empanado, molho ao sugo, muçarela e arroz soltinho.',
      price: '44.90',
      badge: 'Caseiro',
    },
  ],
};

function getCuisineLabel(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes('massa') || text.includes('lasanha') || text.includes('gnocchi') || text.includes('pasta')) {
    return 'Massas';
  }
  if (text.includes('burger') || text.includes('hambúrg') || text.includes('smash') || text.includes('lanche')) {
    return 'Lanches';
  }
  if (text.includes('sushi') || text.includes('temaki') || text.includes('japon')) {
    return 'Japonês';
  }
  if (text.includes('pizza') || text.includes('forno')) {
    return 'Italiano';
  }
  if (text.includes('panela') || text.includes('executivo') || text.includes('baião') || text.includes('caseira')) {
    return 'Comida caseira';
  }

  return 'Delivery';
}

function formatCpfMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
    </article>
  );
}

export function HomePage() {
  const dashboard = useDeliveryDashboard();
  const userEmail = useAuthStore((state) => state.userEmail);
  const userRole = useAuthStore((state) => state.userRole);
  const isAdmin = userRole === 'admin';
  const logout = useAuthStore((state) => state.logout);
  const registerClientPayment = useFinanceStore((state) => state.registerClientPayment);
  const dailyRevenue = useFinanceStore((state) => state.getDailyRevenue());
  const dailyPaymentsCount = useFinanceStore((state) => state.getDailyPaymentsCount());
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashReceived, setCashReceived] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentSuccessMessage, setShowPaymentSuccessMessage] = useState(false);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [restaurantCuisineFilter, setRestaurantCuisineFilter] = useState<string | null>(null);
  const [promotionFocusRestaurantName, setPromotionFocusRestaurantName] = useState<string | null>(null);
  const paymentSuccessTimeoutsRef = useRef<number[]>([]);

  const spotlightRestaurants = dashboard.restaurants.slice(0, 3);
  const cuisineSummary = Array.from(
    new Set(dashboard.restaurants.map((restaurant) => getCuisineLabel(restaurant.name, restaurant.description))),
  );
  const filteredRestaurants = useMemo(() => {
    if (!restaurantCuisineFilter) {
      return dashboard.restaurants;
    }

    return dashboard.restaurants.filter(
      (restaurant) => getCuisineLabel(restaurant.name, restaurant.description) === restaurantCuisineFilter,
    );
  }, [dashboard.restaurants, restaurantCuisineFilter]);
  const orderTotalValue = dashboard.cart ? Number(dashboard.cart.total) : 0;
  const deliveryFeeValue = dashboard.cart ? Math.max(6.9, Math.round(orderTotalValue * 0.09 * 100) / 100) : 0;
  const serviceFeeValue = dashboard.cart ? 2.5 : 0;
  const grandTotalValue = dashboard.cart ? orderTotalValue + deliveryFeeValue + serviceFeeValue : 0;
  const estimatedArrivalMinutes = dashboard.selectedRestaurant
    ? dashboard.selectedRestaurant.name.length % 2 === 0
      ? '35-45 min'
      : '30-40 min'
    : '40 min';
  const cashReceivedValue = Number(cashReceived || 0);
  const cashChange = paymentMethod === 'dinheiro' && cashReceivedValue > grandTotalValue ? cashReceivedValue - grandTotalValue : 0;
  const canOpenPaymentModal = Boolean(dashboard.activeCartId) && !checkoutCompleted;
  const pixCode = useMemo(() => {
    const restaurantSeed = dashboard.selectedRestaurant?.id.replace(/-/g, '').slice(0, 6).toUpperCase() ?? 'DELIVR';
    const valueSeed = (grandTotalValue || orderTotalValue).toFixed(2).replace('.', '');
    return `00020126580014BR.GOV.BCB.PIX0136DELIVERY-ILUSTRACAO@PIX520400005303986540${valueSeed}5802BR5913DELIVERY DEMO6009SAO PAULO62070503***6304${restaurantSeed}`;
  }, [dashboard.selectedRestaurant?.id, grandTotalValue, orderTotalValue]);
  const maskedCardNumber = cardNumber
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
  const maskedCardCpf = formatCpfMask(cardCpf);
  const cardLastDigits = cardNumber.replace(/\D/g, '').slice(-4) || '0000';
  const selectedRestaurantMenu = dashboard.selectedRestaurant
    ? (dashboard.menuItems.length > 0
        ? dashboard.menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            badge: 'Cardápio real',
          }))
        : restaurantShowcaseCatalog[dashboard.selectedRestaurant.name] ?? [
            {
              id: `${dashboard.selectedRestaurant.id}-fallback-1`,
              name: 'Prato do dia',
              description: 'Seleção ilustrativa do restaurante para operação e demonstração.',
              price: '39.90',
              badge: 'Ilustrativo',
            },
          ])
    : [];

  function handleLogout() {
    logout();
    window.location.reload();
  }

  function clearPaymentSuccessTimeouts() {
    paymentSuccessTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    paymentSuccessTimeoutsRef.current = [];
  }

  function playCheckoutSound() {
    try {
      const audioContext = new window.AudioContext();
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      const now = audioContext.currentTime;

      notes.forEach((frequency, index) => {
        const carrier = audioContext.createOscillator();
        const shimmer = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startAt = now + index * 0.065;
        const endAt = startAt + 0.24;

        carrier.type = 'triangle';
        shimmer.type = 'square';
        carrier.frequency.setValueAtTime(frequency, startAt);
        carrier.frequency.exponentialRampToValueAtTime(frequency * 1.02, endAt);
        shimmer.frequency.setValueAtTime(frequency * 2, startAt);

        gainNode.gain.setValueAtTime(0.0001, startAt);
        gainNode.gain.exponentialRampToValueAtTime(0.16, startAt + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

        carrier.connect(gainNode);
        shimmer.connect(gainNode);
        gainNode.connect(audioContext.destination);
        carrier.start(startAt);
        shimmer.start(startAt);
        carrier.stop(endAt);
        shimmer.stop(endAt);
      });

      window.setTimeout(() => {
        void audioContext.close();
      }, 800);
    } catch {
      // Ignore audio errors silently; checkout flow must continue.
    }
  }

  useEffect(() => {
    if (!isPaymentModalOpen) {
      return;
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPaymentModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isPaymentModalOpen]);

  useEffect(() => {
    return () => {
      clearPaymentSuccessTimeouts();
    };
  }, []);

  useEffect(() => {
    setCheckoutCompleted(false);
  }, [dashboard.activeCartId]);

  function getPaymentLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      debito: 'Débito',
      credito: 'Crédito',
      pix: 'Pix',
    };

    return labels[method];
  }

  async function handleCreateRestaurant() {
    if (!restaurantName.trim() || !restaurantDescription.trim()) {
      setStatusError('Informe nome e descrição do restaurante.');
      return;
    }

    try {
      setStatusError(null);
      await dashboard.createRestaurant({
        name: restaurantName.trim(),
        description: restaurantDescription.trim(),
      });
      setPaymentFeedback(`Restaurante ${restaurantName.trim()} criado e aberto.`);
      setRestaurantName('');
      setRestaurantDescription('');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao criar restaurante.');
    }
  }

  async function handleCreateMenuItem() {
    if (!menuName.trim() || !menuDescription.trim() || !menuPrice.trim()) {
      setStatusError('Preencha nome, descrição e preço do item.');
      return;
    }

    try {
      setStatusError(null);
      await dashboard.createMenuItem({
        name: menuName.trim(),
        description: menuDescription.trim(),
        price: menuPrice.trim(),
      });
      setPaymentFeedback(`Item ${menuName.trim()} adicionado ao cardápio.`);
      setMenuName('');
      setMenuDescription('');
      setMenuPrice('');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao criar item do cardápio.');
    }
  }

  async function handleConfirmPayment() {
    if (!dashboard.cart) {
      setStatusError('Abra um carrinho antes de registrar o pagamento.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setStatusError('Informe nome e telefone para concluir checkout e gerar o pedido.');
      return;
    }

    if (paymentMethod === 'dinheiro' && (!cashReceived.trim() || cashReceivedValue < grandTotalValue)) {
      setStatusError('Informe um valor em dinheiro maior ou igual ao total para calcular o troco.');
      return;
    }

    if ((paymentMethod === 'debito' || paymentMethod === 'credito') && (!cardHolderName.trim() || cardNumber.replace(/\D/g, '').length < 13 || cardExpiry.length < 5 || cardCvv.length < 3)) {
      setStatusError('Preencha os dados do cartão: nome, número, validade e CVV.');
      return;
    }

    if (paymentMethod === 'credito' && !cardInstallments) {
      setStatusError('Selecione o parcelamento para o pagamento no crédito.');
      return;
    }

    try {
      setStatusError(null);

      if (!dashboard.order) {
        await dashboard.placeOrder({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          webhook_url: isAdmin ? webhookUrl.trim() || undefined : undefined,
        });
      }

    const paymentMessages: Record<PaymentMethod, string> = {
      dinheiro: `Pagamento em dinheiro confirmado. Troco: ${formatCurrency(cashChange)}`,
      debito: `Pagamento no débito autorizado no cartão final ${cardLastDigits}.`,
      credito: `Pagamento no crédito autorizado no cartão final ${cardLastDigits} (${cardInstallments}x).`,
      pix: 'Pagamento via Pix confirmado imediatamente.',
    };
    setPaymentFeedback(paymentMessages[paymentMethod]);

      if (userRole === 'client') {
        registerClientPayment(grandTotalValue);
      }

    setCheckoutCompleted(true);
    playCheckoutSound();

    clearPaymentSuccessTimeouts();
    setShowPaymentSuccess(true);
    setShowPaymentSuccessMessage(false);

    const revealMessageTimeout = window.setTimeout(() => {
      setShowPaymentSuccessMessage(true);
    }, 550);

    const closeAnimationTimeout = window.setTimeout(() => {
      setShowPaymentSuccess(false);
      setShowPaymentSuccessMessage(false);
      setIsPaymentModalOpen(false);
      setActiveTab('tracking');
    }, 1500);

    paymentSuccessTimeoutsRef.current = [revealMessageTimeout, closeAnimationTimeout];
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao concluir checkout e gerar pedido.');
    }
  }

  async function handleAdvanceStatus(status: OrderStatus) {
    try {
      setStatusError(null);
      await dashboard.changeOrderStatus(status);
      setPaymentFeedback(`Status do pedido atualizado para ${status}.`);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao atualizar status.');
    }
  }

  async function handleAttachWebhook() {
    if (!webhookUrl.trim()) {
      setStatusError('Informe uma URL de webhook válida.');
      return;
    }

    try {
      setStatusError(null);
      await dashboard.attachWebhook(webhookUrl.trim());
      setPaymentFeedback('Webhook vinculado ao pedido com sucesso.');
      setWebhookUrl('');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao adicionar webhook.');
    }
  }

  function handleProceedToPayment() {
    if (checkoutCompleted) {
      setStatusError('Este carrinho já foi pago. Selecione um novo restaurante para iniciar outro checkout.');
      return;
    }

    if (!dashboard.cart?.items.length) {
      setStatusError('Adicione itens ao carrinho antes de seguir para o pagamento.');
      return;
    }

    setStatusError(null);
    setIsPaymentModalOpen(true);
  }

  async function handleRemoveCartItem(menuItemId: string) {
    try {
      setStatusError(null);
      await dashboard.removeItemFromCart(menuItemId);
      setPaymentFeedback('Item removido do carrinho com sucesso.');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao remover item do carrinho.');
    }
  }

  async function handleCopyPixCode() {
    try {
      if (!navigator.clipboard) {
        setStatusError('Copiar automatico indisponivel neste navegador.');
        return;
      }

      await navigator.clipboard.writeText(pixCode);
      setStatusError(null);
      setPaymentFeedback('Codigo Pix copiado para a area de transferencia.');
    } catch {
      setStatusError('Nao foi possivel copiar o codigo Pix.');
    }
  }

  async function handleGoToRestaurant(name: string, description: string) {
    try {
      setStatusError(null);
      setPaymentFeedback(null);
      const existingRestaurant = dashboard.restaurants.find((restaurant) => restaurant.name.toLowerCase() === name.toLowerCase());
      if (existingRestaurant) {
        await dashboard.selectRestaurant(existingRestaurant.id);
        setPaymentFeedback(`Você entrou no restaurante ${existingRestaurant.name}.`);
        return;
      }

      await dashboard.createRestaurant({ name, description });
      setPaymentFeedback(`Você entrou no restaurante ${name}.`);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao abrir restaurante.');
    }
  }

  async function handleOpenPromotion(promotion: PromotionCard) {
    try {
      setStatusError(null);
      setRestaurantCuisineFilter(promotion.cuisineFilter);
      setPromotionFocusRestaurantName(promotion.restaurantName);
      setActiveTab('restaurants');
      await handleGoToRestaurant(promotion.restaurantName, promotion.restaurantDescription);
      document.getElementById('restaurants-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPaymentFeedback(`Promoção ${promotion.title} aberta em ${promotion.restaurantName}.`);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao abrir promoção.');
    }
  }

  async function handleAddItemToCart(item: MenuPreviewItem) {
    try {
      setStatusError(null);

      const isFallbackItem = item.badge === 'Ilustrativo' || item.id.includes('fallback');
      if (isFallbackItem) {
        const createdMenuItem = await dashboard.createMenuItem({
          name: item.name,
          description: item.description,
          price: item.price,
        });

        if (!createdMenuItem) {
          setStatusError('Não foi possível criar item real para adicionar ao carrinho.');
          return;
        }

        await dashboard.addItemToCart(createdMenuItem.id, quantity);
        setPaymentFeedback(`Item ${createdMenuItem.name} criado e adicionado ao carrinho.`);
        return;
      }

      await dashboard.addItemToCart(item.id, quantity);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao adicionar item ao carrinho.');
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.stickyHeader}>
        <div className={styles.stickyHeaderInner}>
          <div className={styles.tabGroup}>
            <button className={`${styles.topTab} ${activeTab === 'home' ? styles.topTabActive : ''}`} type="button" onClick={() => setActiveTab('home')}>
              Início
            </button>
            <button className={`${styles.topTab} ${activeTab === 'restaurants' ? styles.topTabActive : ''}`} type="button" onClick={() => setActiveTab('restaurants')}>
              Restaurantes
            </button>
            <button className={`${styles.topTab} ${activeTab === 'tracking' ? styles.topTabActive : ''}`} type="button" onClick={() => setActiveTab('tracking')}>
              Rastreio do pedido
            </button>
            {isAdmin ? (
              <button className={`${styles.topTab} ${activeTab === 'admin' ? styles.topTabActive : ''}`} type="button" onClick={() => setActiveTab('admin')}>
                Painel admin
              </button>
            ) : null}
          </div>

          <button className={styles.logoutTab} type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.shell}>
        {activeTab === 'home' ? (
          <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Delivery Operations Center</p>
              <h1 className={styles.title}>Página inicial com destaques e promoções.</h1>
              <p className={styles.subtitle}>
                Veja os restaurantes em destaque, acompanhe os indicadores e siga para a aba de restaurantes para montar o carrinho.
              </p>

              <div className={styles.buttonRow}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={() => {
                    void dashboard.seedDemo().catch((error) => {
                      setStatusError(error instanceof Error ? error.message : 'Falha ao carregar demo.');
                    });
                  }}
                >
                  Recarregar demo
                </button>
                <button className={styles.buttonGhost} type="button" onClick={() => setActiveTab('restaurants')}>
                  Ver restaurantes
                </button>
                <button
                  className={styles.buttonGhost}
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(true);
                  }}
                  disabled={!canOpenPaymentModal}
                >
                  Abrir pagamento
                </button>
              </div>

              <div className={styles.adminChipRow}>
                <span className={styles.badge}>{userRole === 'admin' ? 'Admin logado' : 'Cliente logado'}</span>
                <span className={styles.badge}>{userEmail}</span>
              </div>

              <div className={styles.heroTags}>
                {cuisineSummary.map((cuisine) => (
                  <span key={cuisine} className={styles.heroTag}>
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>

            <aside className={styles.heroVisual}>
              <div className={styles.heroVisualTop}>
                <span className={styles.heroVisualLabel}>Restaurantes em destaque</span>
                <strong className={styles.heroVisualValue}>{dashboard.restaurants.length}</strong>
              </div>

              <div className={styles.heroCardStack}>
                {spotlightRestaurants.map((restaurant) => (
                  <article key={restaurant.id} className={styles.heroSpotlightCard}>
                    <div className={styles.heroSpotlightTop}>
                      <div>
                        <h3 className={styles.heroSpotlightTitle}>{restaurant.name}</h3>
                        <p className={styles.heroSpotlightDescription}>{restaurant.description}</p>
                      </div>
                      <span className={styles.badge}>{getCuisineLabel(restaurant.name, restaurant.description)}</span>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.heroStatsStrip}>
                <div>
                  <span className={styles.heroStatLabel}>Carrinho</span>
                  <strong>{dashboard.cart ? formatCurrency(dashboard.cart.total) : 'R$ 0,00'}</strong>
                </div>
                <div>
                  <span className={styles.heroStatLabel}>Status</span>
                  <strong>{dashboard.order ? dashboard.order.status : 'sem pedido'}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.stats}>
            <MetricCard label="Restaurantes ativos" value={String(dashboard.restaurants.length)} />
            <MetricCard label="Itens no menu" value={String(dashboard.menuItems.length)} />
            <MetricCard label="Total do carrinho" value={dashboard.cart ? formatCurrency(dashboard.cart.total) : 'R$ 0,00'} />
            <MetricCard label="Status atual" value={dashboard.order ? dashboard.order.status : 'sem pedido'} />
          </div>

            <section className={styles.promotionGrid}>
              {promotionCards.map((promotion, index) => (
                <button
                  key={promotion.id}
                  type="button"
                  className={styles.promotionCard}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => void handleOpenPromotion(promotion)}
                >
                  <span className={styles.badge}>{promotion.tag}</span>
                  <h3 className={styles.promotionTitle}>{promotion.title}</h3>
                  <p className={styles.promotionDescription}>{promotion.description}</p>
                  <strong className={styles.promotionDiscount}>{promotion.discount}</strong>
                  <span className={styles.promotionCta}>Abrir restaurante</span>
                </button>
              ))}
            </section>
          </section>
        ) : null}

        {dashboard.errorMessage ? <div className={styles.errorBox}>{dashboard.errorMessage}</div> : null}
        {statusError ? <div className={styles.errorBox}>{statusError}</div> : null}

        {activeTab === 'restaurants' ? (
          <section className={styles.gridTwoColumns} id="restaurants-panel">
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Restaurantes</h2>
                  <div className={styles.panelHint}>Selecione um restaurante para abrir ou criar o carrinho.</div>
                </div>
                <span className={styles.badge}>{dashboard.restaurants.length} cadastro(s)</span>
              </div>

              <div className={styles.restaurantMenuGrid}>
                {restaurantMenuOptions.map((option, index) => (
                  <article key={option.name} className={styles.restaurantMenuCard} style={{ animationDelay: `${index * 80}ms` }}>
                    <div className={styles.restaurantMenuHeader}>
                      <div className={styles.restaurantMenuArtwork} style={{ background: `linear-gradient(135deg, ${option.accent}33, rgba(255,255,255,0.04))` }}>
                        <span className={styles.restaurantMenuEmoji}>{option.emoji}</span>
                        <span className={styles.restaurantMenuFrame}>{option.frame}</span>
                        <span className={styles.restaurantMenuSignature}>{option.signatureDish}</span>
                      </div>
                      <div>
                        <h3 className={styles.restaurantMenuTitle}>{option.name}</h3>
                        <p className={styles.restaurantMenuDescription}>{option.description}</p>
                      </div>
                    </div>
                    <div className={styles.buttonRow}>
                      <span className={styles.badge} style={{ borderColor: option.accent, boxShadow: `0 0 0 1px ${option.accent}22 inset` }}>{option.cuisine}</span>
                      <button className={styles.miniButtonPrimary} type="button" onClick={() => void handleGoToRestaurant(option.name, option.description)}>
                        Ir para o restaurante
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.cuisineRail}>
                <button
                  type="button"
                  className={`${styles.cuisineFilterButton} ${restaurantCuisineFilter === null ? styles.cuisineFilterButtonActive : ''}`}
                  onClick={() => {
                    setRestaurantCuisineFilter(null);
                    setPromotionFocusRestaurantName(null);
                  }}
                >
                  Todos
                </button>
                {cuisineSummary.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={`${styles.cuisineFilterButton} ${restaurantCuisineFilter === cuisine ? styles.cuisineFilterButtonActive : ''}`}
                    onClick={() => setRestaurantCuisineFilter(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>

              {isAdmin ? (
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="restaurant-name">Nome</label>
                    <input id="restaurant-name" className={styles.input} value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} placeholder="Ex.: Cantina Aurora" />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="restaurant-description">Descrição</label>
                    <textarea id="restaurant-description" className={styles.textarea} value={restaurantDescription} onChange={(event) => setRestaurantDescription(event.target.value)} placeholder="Massas artesanais, pizzas e delivery premium" />
                  </div>
                  <button className={styles.button} type="button" onClick={() => void handleCreateRestaurant()}>
                    Criar restaurante
                  </button>
                </div>
              ) : null}

              <div className={styles.cardList}>
                {filteredRestaurants.map((restaurant) => {
                  const isActive = restaurant.id === dashboard.selectedRestaurantId;
                  const isPromotionFocus = promotionFocusRestaurantName?.toLowerCase() === restaurant.name.toLowerCase();
                  const cuisine = getCuisineLabel(restaurant.name, restaurant.description);
                  return (
                    <button
                      type="button"
                      key={restaurant.id}
                      className={`${styles.restaurantCard} ${isActive ? styles.restaurantCardActive : ''} ${isPromotionFocus ? styles.restaurantCardPromoFocus : ''}`}
                      onClick={() => void dashboard.selectRestaurant(restaurant.id)}
                    >
                      <div className={styles.menuCardHeader}>
                        <div>
                          <h3 className={styles.restaurantName}>{restaurant.name}</h3>
                          <p className={styles.restaurantDescription}>{restaurant.description}</p>
                        </div>
                        <span className={`${styles.badge} ${isActive ? styles.badgeSuccess : ''}`}>{cuisine}</span>
                      </div>

                      <div className={styles.buttonRow}>
                        <span className={styles.badge}>{isActive ? 'Restaurante ativo' : 'Ir para o restaurante'}</span>
                        <span className={styles.badge}>Cardápio pronto</span>
                      </div>

                      <div className={styles.restaurantCardFoot}>
                        <span className={styles.restaurantCardPill}>{isActive ? 'Aberto para pedidos' : 'Entrada rápida'}</span>
                        <strong>{isActive ? 'Menu em foco agora' : 'Clique para entrar'}</strong>
                      </div>
                    </button>
                  );
                })}
                {!filteredRestaurants.length ? <div className={styles.emptyState}>Nenhum restaurante encontrado para o filtro selecionado.</div> : null}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Cardápio do restaurante</h2>
                  <div className={styles.panelHint}>{dashboard.selectedRestaurant ? dashboard.selectedRestaurant.name : 'Selecione um restaurante para ver os pratos'}</div>
                </div>
                <span className={styles.badge}>{selectedRestaurantMenu.length} prato(s)</span>
              </div>

              {dashboard.selectedRestaurant ? (
                <div className={styles.paymentReview} style={{ marginBottom: '14px' }}>
                  <div className={styles.paymentReviewHeader}>
                    <span className={styles.paymentReviewTitle}>{dashboard.selectedRestaurant.name}</span>
                    <span className={styles.badge}>{getCuisineLabel(dashboard.selectedRestaurant.name, dashboard.selectedRestaurant.description)}</span>
                  </div>
                  <p className={styles.restaurantDescription} style={{ margin: 0 }}>
                    {dashboard.selectedRestaurant.description}
                  </p>
                </div>
              ) : null}

              {isAdmin ? (
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="menu-name">Item</label>
                    <input id="menu-name" className={styles.input} value={menuName} onChange={(event) => setMenuName(event.target.value)} placeholder="Ex.: Hambúrguer artesanal" />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="menu-description">Descrição</label>
                    <textarea id="menu-description" className={styles.textarea} value={menuDescription} onChange={(event) => setMenuDescription(event.target.value)} placeholder="Pão brioche, blend especial e batatas rústicas" />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="menu-price">Preço</label>
                    <input id="menu-price" className={styles.input} value={menuPrice} onChange={(event) => setMenuPrice(event.target.value)} placeholder="45.90" />
                  </div>
                  <button className={styles.buttonGhost} type="button" onClick={() => void handleCreateMenuItem()} disabled={!dashboard.selectedRestaurantId}>
                    Adicionar item
                  </button>
                </div>
              ) : null}

              <div className={styles.cardList}>
                {selectedRestaurantMenu.length > 0 ? (
                  selectedRestaurantMenu.map((item, index) => (
                    <article key={item.id} className={styles.menuCard} style={{ animationDelay: `${index * 70}ms` }}>
                      <div className={styles.menuCardHeader}>
                        <div>
                          <h3 className={styles.menuName}>{item.name}</h3>
                          <p className={styles.menuDescription}>{item.description}</p>
                        </div>
                        <div className={styles.menuPrice}>{formatCurrency(item.price)}</div>
                      </div>

                      <div className={styles.buttonRow}>
                        <span className={styles.badge}>{item.badge}</span>
                        <button className={styles.miniButtonPrimary} type="button" onClick={() => void handleAddItemToCart(item)} disabled={!dashboard.activeCartId}>
                          Adicionar x{quantity}
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className={styles.emptyState}>Nenhum prato disponível. Escolha um restaurante para carregar o cardápio ilustrativo ou real.</div>
                )}
              </div>

              <div className={styles.formRow} style={{ marginTop: '16px' }}>
                <label className={styles.label} htmlFor="quantity">Quantidade padrão de adição</label>
                <input id="quantity" className={styles.input} type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
              </div>

              <div className={styles.paymentReview}>
                <div className={styles.paymentReviewHeader}>
                  <span className={styles.paymentReviewTitle}>Análise do carrinho</span>
                  <span className={styles.badge}>{dashboard.cart?.items.length ? `${dashboard.cart.items.length} item(s)` : 'Carrinho vazio'}</span>
                </div>

                {dashboard.cart?.items.length ? (
                  <div className={styles.paymentItemList}>
                    {dashboard.cart.items.map((item) => (
                      <article key={item.menu_item_id} className={styles.paymentItemCard}>
                        <div className={styles.paymentItemInfo}>
                          <h4 className={styles.paymentItemName}>{item.name}</h4>
                          <p className={styles.paymentItemMeta}>
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <div className={styles.cartItemActions}>
                          <strong className={styles.paymentItemTotal}>{formatCurrency(item.subtotal)}</strong>
                          <button className={styles.removeItemButton} type="button" onClick={() => void handleRemoveCartItem(item.menu_item_id)}>
                            X
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>Adicione itens para revisar o carrinho antes de pagar.</div>
                )}

                <div className={styles.buttonRow}>
                  <button className={styles.button} type="button" onClick={handleProceedToPayment} disabled={!dashboard.cart?.items.length}>
                    Efetuar pagamento
                  </button>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === 'tracking' ? (
          <section className={styles.gridTwoColumns} id="payment-panel">
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Checkout e pedido</h2>
                  <div className={styles.panelHint}>Feche o pedido e acompanhe o andamento na mesma aba.</div>
                </div>
                <span className={styles.badge}>{dashboard.cart ? formatCurrency(dashboard.cart.total) : 'R$ 0,00'}</span>
              </div>

              <div className={styles.stack}>
                <div className={styles.cartHeader}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ fontSize: '1.05rem' }}>Carrinho atual</h3>
                    <div className={styles.panelHint}>{dashboard.cart ? formatDateTime(dashboard.cart.created_at) : 'Sem carrinho selecionado'}</div>
                  </div>
                  <span className={styles.cartTotal}>{dashboard.cart ? formatCurrency(dashboard.cart.total) : 'R$ 0,00'}</span>
                </div>

                <div className={styles.cardList} style={{ maxHeight: '220px' }}>
                  {dashboard.cart?.items.length ? (
                    dashboard.cart.items.map((item) => (
                      <div key={item.menu_item_id} className={styles.cartItemCard}>
                        <div className={styles.cartHeader}>
                          <div>
                            <h4 className={styles.cartItemTitle}>{item.name}</h4>
                            <p className={styles.cartItemMeta}>
                              {item.quantity} x {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <strong>{formatCurrency(item.subtotal)}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>O carrinho aparecerá aqui assim que um restaurante for selecionado.</div>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="customer-name">Cliente</label>
                    <input id="customer-name" className={styles.input} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Ex.: Mariana Silva" />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="customer-phone">Telefone</label>
                    <input id="customer-phone" className={styles.input} value={customerPhone} onChange={(event) => setCustomerPhone(formatPhoneMask(event.target.value))} placeholder="(11) 99999-9999" />
                  </div>
                  {isAdmin ? (
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="webhook-url">Webhook opcional</label>
                      <input id="webhook-url" className={styles.input} value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://exemplo.com/webhook" />
                    </div>
                  ) : null}
                  <div className={styles.buttonRow}>
                    {isAdmin ? (
                      <button className={styles.buttonGhost} type="button" onClick={() => void handleAttachWebhook()} disabled={!dashboard.activeOrderId}>
                        Adicionar webhook
                      </button>
                    ) : null}
                    <button className={styles.buttonGhost} type="button" onClick={() => setIsPaymentModalOpen(true)} disabled={!canOpenPaymentModal}>
                      Abrir modal de pagamento
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Rastreamento do pedido</h2>
                  <div className={styles.panelHint}>Atualização de status, eventos e envio de webhook.</div>
                </div>
                <span className={`${styles.badge} ${dashboard.order?.status === 'entregue' ? styles.badgeSuccess : dashboard.order?.status === 'a_caminho' ? styles.badgeWarning : ''}`}>
                  {dashboard.order ? dashboard.order.status : 'sem pedido ativo'}
                </span>
              </div>

              {dashboard.order ? (
                <div className={styles.split}>
                  {isAdmin ? (
                    <div className={styles.orderActions}>
                      <button className={styles.miniButtonPrimary} type="button" onClick={() => void handleAdvanceStatus('a_caminho')} disabled={dashboard.order.status === 'a_caminho' || dashboard.order.status === 'entregue'}>
                        A caminho
                      </button>
                      <button className={styles.miniButton} type="button" onClick={() => void handleAdvanceStatus('entregue')} disabled={dashboard.order.status === 'entregue'}>
                        Entregue
                      </button>
                    </div>
                  ) : null}

                  <div className={styles.timeline}>
                    {dashboard.order.events.map((event) => (
                      <article key={event.id} className={styles.timelineItem}>
                        <div className={styles.timelineHeader}>
                          <h3 className={styles.timelineTitle}>{event.status}</h3>
                          <span className={styles.badge}>{formatDateTime(event.created_at)}</span>
                        </div>
                        <p className={styles.timelineMeta}>{event.note}</p>
                      </article>
                    ))}
                  </div>

                  {isAdmin ? (
                    <div className={styles.buttonRow}>
                      {dashboard.order.webhook_urls.map((webhook) => (
                        <span key={webhook} className={styles.badge}>
                          {webhook}
                        </span>
                      ))}
                      {!dashboard.order.webhook_urls.length ? <span className={styles.badge}>Nenhum webhook vinculado</span> : null}
                    </div>
                  ) : null}

                  <div className={styles.buttonRow}>
                    <span className={styles.badge}>Pedido #{dashboard.order.id.slice(0, 8)}</span>
                    <span className={styles.badge}>Total {formatCurrency(dashboard.order.total)}</span>
                    <span className={styles.badge}>Atualizado {formatDateTime(dashboard.order.updated_at)}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Nenhum pedido aberto. Selecione um restaurante, adicione itens ao carrinho e gere um pedido para ver o rastreamento aqui.
                </div>
              )}
            </article>
          </section>
        ) : null}

        {activeTab === 'admin' && isAdmin ? (
          <section className={styles.gridTwoColumns} id="admin-panel">
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Painel financeiro</h2>
                  <div className={styles.panelHint}>Informações administrativas de receita ilustrativa do dia.</div>
                </div>
                <span className={styles.badge}>Acesso exclusivo admin</span>
              </div>

              <div className={styles.stats}>
                <MetricCard label="Lucro do dia" value={formatCurrency(dailyRevenue)} />
                <MetricCard label="Pagamentos hoje" value={String(dailyPaymentsCount)} />
                <MetricCard label="Ticket médio" value={dailyPaymentsCount > 0 ? formatCurrency(dailyRevenue / dailyPaymentsCount) : 'R$ 0,00'} />
                <MetricCard label="Perfil" value="Administrador" />
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Controle operacional</h2>
                  <div className={styles.panelHint}>Somente administradores podem visualizar estas métricas.</div>
                </div>
                <span className={styles.badge}>Protegido</span>
              </div>

              <div className={styles.paymentReview}>
                <div className={styles.paymentReviewHeader}>
                  <span className={styles.paymentReviewTitle}>Resumo do dia</span>
                  <span className={styles.badge}>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>

                <div className={styles.paymentSummaryFooter}>
                  <div>
                    <span className={styles.heroStatLabel}>Receita ilustrativa</span>
                    <strong>{formatCurrency(dailyRevenue)}</strong>
                  </div>
                  <div>
                    <span className={styles.heroStatLabel}>Pagamentos confirmados</span>
                    <strong>{dailyPaymentsCount}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>
        ) : null}
      </div>

      {isPaymentModalOpen ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setIsPaymentModalOpen(false)}>
          <section className={styles.modalCard} role="dialog" aria-modal="true" aria-label="Pagamento" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.panelTitle}>Aba de pagamento</h2>
                <p className={styles.panelHint}>Ilustração realista para cartão, dinheiro e Pix com QR Code.</p>
              </div>
              <button className={styles.miniButton} type="button" onClick={() => setIsPaymentModalOpen(false)}>
                Fechar
              </button>
            </div>

            <div className={styles.paymentPanel}>
              <div className={styles.paymentHeader}>
                <div>
                  <h3 className={styles.panelTitle} style={{ fontSize: '1.05rem' }}>Fechamento do pagamento</h3>
                  <div className={styles.panelHint}>Simulação local para dinheiro, débito, crédito ou Pix.</div>
                </div>
                <span className={styles.badge}>{getPaymentLabel(paymentMethod)}</span>
              </div>

              {paymentFeedback ? <div className={styles.paymentReviewTitle}>{paymentFeedback}</div> : null}

              <div className={styles.paymentReview}>
                <div className={styles.paymentReviewHeader}>
                  <span className={styles.paymentReviewTitle}>Dados do cliente para checkout</span>
                  <span className={styles.badge}>Obrigatório</span>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="customer-name-modal">Nome do cliente</label>
                    <input
                      id="customer-name-modal"
                      className={styles.input}
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Ex.: Mariana Silva"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="customer-phone-modal">Telefone</label>
                    <input
                      id="customer-phone-modal"
                      className={styles.input}
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(formatPhoneMask(event.target.value))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.paymentReview}>
                <div className={styles.paymentReviewHeader}>
                  <span className={styles.paymentReviewTitle}>Itens que entram no pagamento</span>
                  <span className={styles.badge}>{dashboard.cart?.items.length ? `${dashboard.cart.items.length} item(s)` : 'Carrinho vazio'}</span>
                </div>

                {dashboard.cart?.items.length ? (
                  <div className={styles.paymentItemList}>
                    {dashboard.cart.items.map((item, index) => (
                      <article key={item.menu_item_id} className={styles.paymentItemCard} style={{ animationDelay: `${index * 70}ms` }}>
                        <div className={styles.paymentItemInfo}>
                          <h4 className={styles.paymentItemName}>{item.name}</h4>
                          <p className={styles.paymentItemMeta}>
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <strong className={styles.paymentItemTotal}>{formatCurrency(item.subtotal)}</strong>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>Revise os itens do carrinho antes de fechar o pagamento. Nenhum item foi selecionado ainda.</div>
                )}

                <div className={styles.checkoutSummaryBand}>
                  <div>
                    <span className={styles.heroStatLabel}>Taxa de entrega</span>
                    <strong>{formatCurrency(deliveryFeeValue)}</strong>
                  </div>
                  <div>
                    <span className={styles.heroStatLabel}>Taxa de serviço</span>
                    <strong>{formatCurrency(serviceFeeValue)}</strong>
                  </div>
                  <div>
                    <span className={styles.heroStatLabel}>Chegada estimada</span>
                    <strong>{estimatedArrivalMinutes}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.paymentGrid}>
                <button type="button" className={`${styles.paymentMethodCard} ${paymentMethod === 'dinheiro' ? styles.paymentMethodCardActive : ''}`} onClick={() => setPaymentMethod('dinheiro')}>
                  <span className={styles.paymentMethodLabel}>Dinheiro</span>
                  <span className={styles.paymentMethodMeta}>Troco calculado na hora</span>
                </button>
                <button type="button" className={`${styles.paymentMethodCard} ${paymentMethod === 'debito' ? styles.paymentMethodCardActive : ''}`} onClick={() => setPaymentMethod('debito')}>
                  <span className={styles.paymentMethodLabel}>Cartão de débito</span>
                  <span className={styles.paymentMethodMeta}>Pagamento à vista na maquininha</span>
                </button>
                <button type="button" className={`${styles.paymentMethodCard} ${paymentMethod === 'credito' ? styles.paymentMethodCardActive : ''}`} onClick={() => setPaymentMethod('credito')}>
                  <span className={styles.paymentMethodLabel}>Cartão de crédito</span>
                  <span className={styles.paymentMethodMeta}>1x a 12x, sujeito à bandeira</span>
                </button>
                <button type="button" className={`${styles.paymentMethodCard} ${paymentMethod === 'pix' ? styles.paymentMethodCardActive : ''}`} onClick={() => setPaymentMethod('pix')}>
                  <span className={styles.paymentMethodLabel}>Pix</span>
                  <span className={styles.paymentMethodMeta}>Confirmação imediata</span>
                </button>
              </div>

              {(paymentMethod === 'debito' || paymentMethod === 'credito') ? (
                <div className={styles.cardFormArea}>
                  <div className={styles.cardFormGrid}>
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="card-holder-name">Nome no cartão</label>
                      <input id="card-holder-name" className={styles.input} value={cardHolderName} onChange={(event) => setCardHolderName(event.target.value)} placeholder="Ex.: Mariana Silva" />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="card-number">Número do cartão</label>
                      <input id="card-number" className={styles.input} inputMode="numeric" value={maskedCardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="card-expiry">Validade</label>
                      <input
                        id="card-expiry"
                        className={styles.input}
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
                          const nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                          setCardExpiry(nextValue);
                        }}
                        placeholder="MM/AA"
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="card-cvv">CVV</label>
                      <input id="card-cvv" className={styles.input} inputMode="numeric" value={cardCvv} onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.label} htmlFor="card-cpf">CPF do titular</label>
                      <input id="card-cpf" className={styles.input} inputMode="numeric" value={maskedCardCpf} onChange={(event) => setCardCpf(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="000.000.000-00" />
                    </div>
                    {paymentMethod === 'credito' ? (
                      <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="card-installments">Parcelamento</label>
                        <select id="card-installments" className={styles.select} value={cardInstallments} onChange={(event) => setCardInstallments(event.target.value)}>
                          {Array.from({ length: 12 }).map((_, index) => (
                            <option key={String(index + 1)} value={String(index + 1)}>
                              {index + 1}x {index === 0 ? 'sem juros' : 'ilustrativo'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.cardPreview}>
                    <span className={styles.cardPreviewBrand}>{paymentMethod === 'credito' ? 'Credito' : 'Debito'}</span>
                    <strong className={styles.cardPreviewNumber}>{maskedCardNumber || '0000 0000 0000 0000'}</strong>
                    <div className={styles.cardPreviewFooter}>
                      <span>{cardHolderName || 'NOME DO TITULAR'}</span>
                      <span>{cardExpiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {paymentMethod === 'pix' ? (
                <div className={styles.pixPanel}>
                  <div className={styles.pixQrCode} aria-hidden="true" />
                  <div className={styles.pixCodeArea}>
                    <span className={styles.heroStatLabel}>Pix copia e cola ilustrativo</span>
                    <p className={styles.pixCodeText}>{pixCode}</p>
                    <div className={styles.pixActions}>
                      <button className={styles.miniButton} type="button" onClick={() => void handleCopyPixCode()}>
                        Copiar codigo Pix
                      </button>
                      <span className={styles.badge}>QR Code ilustrativo</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {paymentMethod === 'dinheiro' ? (
                <div className={styles.formRow}>
                  <label className={styles.label} htmlFor="cash-received">Valor entregue em dinheiro</label>
                  <input id="cash-received" className={styles.input} inputMode="decimal" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} placeholder="Ex.: 100.00" />
                </div>
              ) : null}

              <div className={styles.paymentSummary}>
                <div>
                  <span className={styles.heroStatLabel}>Total do pedido</span>
                  <strong>{dashboard.cart ? formatCurrency(orderTotalValue) : 'R$ 0,00'}</strong>
                </div>
                <div>
                  <span className={styles.heroStatLabel}>Forma selecionada</span>
                  <strong>{getPaymentLabel(paymentMethod)}</strong>
                </div>
                <div>
                  <span className={styles.heroStatLabel}>Total final</span>
                  <strong>{dashboard.cart ? formatCurrency(grandTotalValue) : 'R$ 0,00'}</strong>
                </div>
              </div>

              <div className={styles.paymentSummaryFooter}>
                <div>
                  <span className={styles.heroStatLabel}>Troco / retorno</span>
                  <strong>{paymentMethod === 'dinheiro' ? formatCurrency(cashChange) : 'N/A'}</strong>
                </div>
                <div>
                  <span className={styles.heroStatLabel}>Resumo do fluxo</span>
                  <strong>{dashboard.cart ? 'Pedido pronto para envio' : 'Aguardando carrinho'}</strong>
                </div>
              </div>

              <div className={styles.buttonRow}>
                <button className={styles.buttonGhost} type="button" onClick={handleConfirmPayment} disabled={!dashboard.activeCartId}>
                  Confirmar pagamento
                </button>
                <button className={styles.miniButton} type="button" onClick={() => setIsPaymentModalOpen(false)}>
                  Fechar aba
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {showPaymentSuccess ? (
        <div className={styles.successOverlay} role="status" aria-live="polite">
          <div className={styles.successCard}>
            <svg className={styles.successCheckmark} viewBox="0 0 120 120" aria-hidden="true">
              <circle className={styles.successCircle} cx="60" cy="60" r="44" />
              <path className={styles.successCheck} d="M38 62 L54 78 L84 46" />
            </svg>
            {showPaymentSuccessMessage ? <p className={styles.successText}>Pedido feito com sucesso...</p> : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
