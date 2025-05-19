import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

const PaymentReminderEmail = () => {
  return (
    <Html>
      <Head />
      <Preview>Recordatorio: Su pago mensual vence en 2 días</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-[40px] bg-white p-[20px] rounded-md shadow-sm max-w-[600px]">
            <Img
              src="https://new.email/static/app/placeholder.png?height=60&width=200"
              alt="Logo de la empresa"
              className="w-full h-auto object-cover max-w-[200px] mx-auto mb-[20px]"
            />
            
            <Heading className="text-[24px] font-bold text-center text-gray-800 my-[16px]">
              Recordatorio de Pago
            </Heading>
            
            <Section className="mb-[24px]">
              <Text className="text-[16px] text-gray-700 mb-[8px]">
                Estimado(a) cliente,
              </Text>
              
              <Text className="text-[16px] text-gray-700 mb-[16px]">
                Le recordamos que su pago mensual <span className="font-bold">vence en 2 días</span>. Para evitar interrupciones en su servicio, le recomendamos realizar el pago lo antes posible.
              </Text>
              
              <Text className="text-[16px] text-gray-700 mb-[24px]">
                Si ya ha realizado el pago, por favor ignore este mensaje.
              </Text>
            </Section>
            
            <Section className="bg-gray-50 p-[16px] rounded-md mb-[24px]">
              <Text className="text-[16px] font-bold text-gray-800 mb-[8px]">
                Detalles del pago:
              </Text>
              <Text className="text-[15px] text-gray-700 mb-[4px]">
                • Fecha de vencimiento: <span className="font-bold">20 de marzo de 2025</span>
              </Text>
              <Text className="text-[15px] text-gray-700 mb-[4px]">
                • Monto a pagar: <span className="font-bold">$XX.XX</span>
              </Text>
              <Text className="text-[15px] text-gray-700">
                • Referencia: <span className="font-bold">Su número de cuenta</span>
              </Text>
            </Section>
            
            <Section className="text-center mb-[32px]">
              <Button
                className="bg-blue-600 text-white font-bold py-[12px] px-[24px] rounded-md no-underline text-center box-border"
                href="https://example.com/payment"
              >
                Realizar Pago Ahora
              </Button>
            </Section>
            
            <Section className="mb-[24px]">
              <Text className="text-[15px] text-gray-700 mb-[16px]">
                Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos respondiendo a este correo o llamando a nuestro servicio de atención al cliente.
              </Text>
              
              <Text className="text-[15px] text-gray-700">
                Gracias por su preferencia,
              </Text>
              <Text className="text-[15px] font-bold text-gray-800">
                Equipo de Atención al Cliente
              </Text>
            </Section>
            
            <Hr className="border-gray-200 my-[16px]" />
            
            <Section>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                Av. 5 de Julio, Maracaibo, Venezuela
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                © 2025 Nombre de la Empresa. Todos los derechos reservados.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                <Link href="https://example.com/unsubscribe" className="text-gray-500 underline">
                  Cancelar suscripción
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentReminderEmail;