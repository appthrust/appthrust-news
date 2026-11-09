import type { Item, ItemSummary, Locale } from '../api/news'

type Translation = { title: string; summary: string; markdown: string }
type Fixture = Omit<ItemSummary, 'title' | 'summary' | 'locale'> & { ja: Translation; en?: Translation }

// Development-only articles. Production news always comes from the embedded edition API.
export const fixtures: readonly Fixture[] = [
  {
    id: '2026-11-08-welcome', category: 'announcement', publishedAt: '2026-11-08T09:00:00+09:00', pinned: true, tags: ['AppThrust News'],
    ja: {
      title: 'AppThrust News へようこそ',
      summary: 'AppThrust の新機能やリリース情報を、Project の中から確認できるようになりました。',
      markdown: 'AppThrust News は、AppThrust の最新情報をお届けするアプリです。いつもの Project から、新しい機能やサービスの変更を確認できます。\n\n## このアプリでお届けすること\n\n- **リリース情報** — 改善点や変更内容をまとめてご紹介します。\n- **新機能** — 新しく使えるようになった機能やアプリをご案内します。\n- **運用のお知らせ** — メンテナンスや障害に関する情報をお知らせします。\n- **イベント** — 製品をより活用するための機会をご案内します。\n\n## 気になるニュースを、すぐに\n\n一覧のカテゴリを選ぶと、読みたい種類のニュースに絞り込めます。まだ見ていない記事には「未読」が表示されます。既読の状態は、お使いのブラウザに保存されます。\n\nこれからも、日々の開発に役立つ情報をお届けしていきます。',
    },
    en: {
      title: 'Welcome to AppThrust News',
      summary: 'Read product news and release updates without leaving your Project.',
      markdown: 'AppThrust News brings product updates to your Project.\n\n## What you will find here\n\n- **Releases** — Improvements and changes in each edition.\n- **New features** — New capabilities and marketplace apps.\n- **Operations** — Maintenance and incident notices.\n- **Events** — Opportunities to learn more about the product.\n\n## Find the news you need\n\nChoose a category to narrow the list. Items you have not seen are marked unread. Read status is saved in this browser.',
    },
  },
  {
    id: '2026-11-10-release', category: 'release', publishedAt: '2026-11-10T09:00:00+09:00', pinned: false, tags: ['release'],
    ja: { title: '11 月のアップデートをお届けします', summary: 'アプリの状態表示を改善し、日々の操作をよりわかりやすくしました。', markdown: '11 月のアップデートでは、日常的な操作のわかりやすさを改善しました。\n\n## 主な変更\n\n- アプリの状態を確認しやすくしました。\n- 小さな画面での表示を調整しました。\n- エラーメッセージの説明を見直しました。\n\n変更は、各 Project に順次反映されます。' },
    en: { title: 'The November update is here', summary: 'Clearer app status and improvements to everyday interactions.', markdown: 'The November update makes everyday tasks clearer.\n\n## Changes\n\n- Easier-to-read app status.\n- Layout improvements for smaller screens.\n- Clearer error messages.\n\nChanges are rolling out to Projects.' },
  },
  {
    id: '2026-11-09-marketplace', category: 'feature', publishedAt: '2026-11-09T10:00:00+09:00', updatedAt: '2026-11-10T12:00:00+09:00', pinned: false, tags: ['marketplace'],
    ja: { title: 'マーケットプレイスで、必要なアプリを見つけやすく', summary: 'カテゴリからアプリを探し、詳細を確認してから Project に追加できます。', markdown: 'マーケットプレイスから、チームに必要なアプリを選べます。\n\n## アプリを探す\n\nカテゴリを選んで、目的に合ったアプリを探してください。詳細ページでは説明やスクリーンショットを確認できます。\n\n## Project に追加する\n\nアプリの追加は、Project の管理者が行います。追加後は、画面右上のアプリメニューから開けます。\n\n> 訂正：アプリを追加できるメンバーの説明を更新しました。' },
    en: { title: 'Find the right app in the marketplace', summary: 'Browse categories and review app details before adding one to your Project.', markdown: 'Find apps for your team in the marketplace.\n\n## Browse apps\n\nChoose a category and review descriptions and screenshots.\n\n## Add to your Project\n\nYour Project administrator can add an app. Open installed apps from the app menu.\n\n> Correction: updated who can add apps.' },
  },
  {
    id: '2026-11-07-maintenance', category: 'maintenance', publishedAt: '2026-11-07T15:00:00+09:00', pinned: false, tags: ['maintenance'],
    ja: { title: '定期メンテナンスについて', summary: '安定したサービス提供のため、定期メンテナンスの内容と確認方法をご案内します。', markdown: '安定したサービス提供のため、定期的にメンテナンスを行っています。\n\n## ご確認いただきたいこと\n\n作業の日時や影響がある場合は、事前にお知らせします。ご利用の環境に関する個別の連絡は、管理者からの案内をご確認ください。' },
  },
  {
    id: '2026-11-06-community', category: 'event', publishedAt: '2026-11-06T13:00:00+09:00', pinned: false, tags: ['community'],
    ja: { title: 'AppThrust 活用のヒントを共有する会', summary: 'チームでの使い方や開発の工夫を共有する、オンラインイベントをご紹介します。', markdown: 'AppThrust の使い方や工夫を共有するオンラインイベントを予定しています。\n\n## お話しする内容\n\n- Project の使い分け\n- アプリの選び方\n- チームで使うときのヒント\n\n開催日時と参加方法は、決まり次第お知らせします。' },
    en: { title: 'Sharing practical AppThrust tips', summary: 'An upcoming online event about team workflows and everyday development.', markdown: 'We are planning an online event to share practical AppThrust tips.\n\n## Topics\n\n- Organizing Projects\n- Choosing apps\n- Working as a team\n\nThe date and participation details will be announced when available.' },
  },
  {
    id: '2026-11-05-incident', category: 'incident', publishedAt: '2026-11-05T18:00:00+09:00', pinned: false, tags: ['resolved'],
    ja: { title: 'アプリ一覧の表示遅延は解消しました', summary: '一部のアプリ一覧で発生していた表示の遅延について、復旧をお知らせします。', markdown: '一部のアプリ一覧で発生していた表示の遅延は解消しました。\n\n## 状況\n\nアプリ一覧が通常どおり表示されることを確認しています。ご不便をおかけしました。' },
    en: { title: 'App listing delay resolved', summary: 'The delay affecting some app lists has been resolved.', markdown: 'The delay affecting some app lists has been resolved.\n\n## Status\n\nApp lists are displaying normally again. We apologize for the inconvenience.' },
  },
]

export function localizedItems(locale: Locale): Item[] {
  return fixtures.map(({ ja, en, ...metadata }) => ({ ...metadata, ...(locale === 'en' && en ? en : ja), locale: locale === 'en' && en ? 'en' as const : 'ja' as const }))
}
