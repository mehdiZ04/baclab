const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zoom_dashboard',
  user: 'postgres',
  password: 'mehdi',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const modules = [
  {
    moduleNumber: 0,
    title: "Planification",
    description: "Introduction au programme et à la plateforme",
    order: 0,
  },
  {
    moduleNumber: 1,
    title: "Introduction à l'Algorithmique",
    description: "Définition d'un algorithme, étapes d'un algorithme, notions de pseudo-code, comment écrire un algorithme clair",
    order: 1,
  },
  {
    moduleNumber: 2,
    title: "Les Variables & Types de Données",
    description: "Déclaration & affectation, lecture & écriture, conversion de types",
    order: 2,
  },
  {
    moduleNumber: 3,
    title: "Opérations Arithmétiques & Logiques",
    description: "Opérateurs arithmétiques (+, –, ×, ÷, mod), comparateurs (>, <, >=, ==…), opérateurs logiques (ET, OU, NON)",
    order: 3,
  },
  {
    moduleNumber: 4,
    title: "Les fonctions prédéfinies",
    description: "Convch, Estnum, Valeur, Long, Sous_chaine, Effacer, Majus, ord, chr",
    order: 4,
  },
  {
    moduleNumber: 5,
    title: "Instructions Conditionnelles (SI, SINON)",
    description: "Structure SI / SINON, conditions imbriquées, algorithmes décisionnels",
    order: 5,
  },
  {
    moduleNumber: 6,
    title: "Boucles (TANT QUE, POUR)",
    description: "Boucle POUR, TANT QUE, RÉPÉTER...JUSQU'À, compteurs & accumulateurs",
    order: 6,
  },
  {
    moduleNumber: 7,
    title: "Fonctions & Procédures",
    description: "Importance de la décomposition, déclaration et utilisation, différence entre fonction et procédure",
    order: 7,
  },
  {
    moduleNumber: 8,
    title: "Les Tableaux",
    description: "Déclaration, remplissage, affichage, recherche simple",
    order: 8,
  },
  {
    moduleNumber: 9,
    title: "Les Algorithmes de Tri",
    description: "Tri par sélection, tri par insertion, tri à bulles",
    order: 9,
  },
  {
    moduleNumber: 10,
    title: "Les Algorithmes de recherche",
    description: "Recherche séquentielle, recherche dichotomique",
    order: 10,
  },
];

async function seedCourses() {
  try {
    console.log('Starting to seed course modules...');

    for (const moduleData of modules) {
      const module = await prisma.courseModule.upsert({
        where: { moduleNumber: moduleData.moduleNumber },
        update: moduleData,
        create: moduleData,
      });
      
      console.log(`Created/Updated Module ${module.moduleNumber}: ${module.title}`);
    }

    console.log('Course modules seeded successfully!');
  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedCourses();
