import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);

export async function POST(
  request: Request
) {
  try {
    // ========================================
    // ADMIN認証
    // ========================================

    const adminSecret =
      request.headers.get("x-admin-secret");

    if (
      !adminSecret ||
      adminSecret !==
        process.env.ADMIN_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            "管理者認証に失敗しました。",
        },
        { status: 401 }
      );
    }

    // ========================================
    // 受信データ
    // ========================================

    const body = await request.json();

    const {
      id,
      date,
      title,
      city,
      venue,
      tour,
      artists,
      setlist,
      encore,
      memo,
      excludeFromSongHistory,
    } = body;

    // ========================================
    // 必須項目
    // ========================================

    if (
      !id ||
      !date ||
      !title ||
      !city ||
      !venue
    ) {
      return NextResponse.json(
        {
          error:
            "日付・公演名・都道府県・会場は必須です。",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(setlist) ||
      setlist.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "セットリストがありません。",
        },
        { status: 400 }
      );
    }

    // ========================================
    // Supabaseへ保存
    // ========================================

    const { data, error } =
      await supabase
        .from("lives")
        .insert({
          id,
          date,
          title,
          city,
          venue,
          tour: tour || null,

          artists: Array.isArray(artists)
            ? artists
            : [],

          setlist,

          encore: Array.isArray(encore)
            ? encore
            : [],

          memo: memo || null,

          exclude_from_song_history:
            excludeFromSongHistory === true,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Supabase insert error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "ライブの保存に失敗しました。",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        live: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/lives error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "予期しないエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}