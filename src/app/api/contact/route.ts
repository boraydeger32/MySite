import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Ad Soyad zorunludur'),
  email: z.string().email('Gecerli bir email adresi giriniz'),
  phone: z.string().optional(),
  service: z.string().min(1, 'Hizmet secimi zorunludur'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalidir'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    console.log('Contact form submission:', validated);

    return NextResponse.json({
      success: true,
      message: 'Mesajiniz alindi!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasyon hatasi',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Bir hata olustu.' },
      { status: 400 }
    );
  }
}
