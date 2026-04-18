/**
 * seed.ts
 *
 * Imports all question JSON files from the mobile app into PostgreSQL.
 * Run once after setting up the DB: yarn seed
 *
 * Expects the quiz app to be at ../  (sibling directory structure)
 * Questions live at: ../assets/data/questions/{platform}/{cert}/quiz-N.json
 */

import '../src/config'; // load .env
import { db } from '../src/db/client';
import fs from 'fs';
import path from 'path';

// Maps cert folder name → cert ID and platform ID
// Add new certs here as you create them
const CERT_MAP: Record<string, { certId: string; platformId: string }> = {
  'solutions-architect': { certId: 'aws-saa', platformId: 'aws' },
  'developer-associate':  { certId: 'aws-dva', platformId: 'aws' },
  'sysops-admin':         { certId: 'aws-soa', platformId: 'aws' },
  'devops-professional':  { certId: 'aws-dop', platformId: 'aws' },
  'az-900':               { certId: 'azure-az900', platformId: 'azure' },
  'az-104':               { certId: 'azure-az104', platformId: 'azure' },
  'az-305':               { certId: 'azure-az305', platformId: 'azure' },
  'associate-cloud-engineer':     { certId: 'gcp-ace', platformId: 'gcp' },
  'professional-cloud-architect': { certId: 'gcp-pca', platformId: 'gcp' },
  'professional-data-engineer':   { certId: 'gcp-pde', platformId: 'gcp' },
  'terraform-associate':          { certId: 'devops-terraform', platformId: 'devops' },
  'cka-ckad':                     { certId: 'devops-cka', platformId: 'devops' },
  'docker-dca':                   { certId: 'devops-docker', platformId: 'devops' },
};


interface Question {
  id: string;
  question_number: string;
  question: string;
  choices: string[];
  correct_answer_indices: number[];
  explanation_html: string;
}

async function seed() {
  const questionsBase = path.resolve(__dirname, '../../assets/data/questions');

  if (!fs.existsSync(questionsBase)) {
    console.error(`Questions directory not found: ${questionsBase}`);
    process.exit(1);
  }

  let total = 0;

  for (const platform of fs.readdirSync(questionsBase)) {
    const platformDir = path.join(questionsBase, platform);
    if (!fs.statSync(platformDir).isDirectory()) continue;

    for (const certFolder of fs.readdirSync(platformDir)) {
      const certDir = path.join(platformDir, certFolder);
      if (!fs.statSync(certDir).isDirectory()) continue;

      const meta = CERT_MAP[certFolder];
      if (!meta) {
        console.warn(`  Skipping unknown cert folder: ${certFolder}`);
        continue;
      }

      for (const file of fs.readdirSync(certDir)) {
        if (!file.endsWith('.json')) continue;

        // Derive quiz ID:
        //   quiz-1.json  → aws-saa-quiz-1
        //   sample.json  → aws-saa-sample
        const stem = file.replace('.json', ''); // "quiz-1" or "sample"
        const quizId = `${meta.certId}-${stem}`;
        const isFree = stem === 'sample';

        const questions: Question[] = JSON.parse(
          fs.readFileSync(path.join(certDir, file), 'utf-8')
        );

        for (const q of questions) {
          await db.query(
            `INSERT INTO questions
               (id, quiz_id, cert_id, platform_id, question_number, question,
                choices, correct_answer_indices, explanation_html, is_free)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT (id) DO UPDATE SET
               question              = EXCLUDED.question,
               choices               = EXCLUDED.choices,
               correct_answer_indices = EXCLUDED.correct_answer_indices,
               explanation_html      = EXCLUDED.explanation_html,
               is_free               = EXCLUDED.is_free`,
            [
              q.id,
              quizId,
              meta.certId,
              meta.platformId,
              q.question_number,
              q.question,
              JSON.stringify(q.choices),
              JSON.stringify(q.correct_answer_indices),
              q.explanation_html,
              isFree,
            ]
          );
          total++;
        }

        console.log(`  ✓ ${quizId}: ${questions.length} questions${isFree ? ' (free sample)' : ''}`);
      }
    }
  }

  console.log(`\nDone. Inserted/updated ${total} questions.`);
  await db.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
