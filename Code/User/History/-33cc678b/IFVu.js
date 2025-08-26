const { chromium } = require('playwright');

async function testStakeBrazil() {
  // 1. Lanzar el navegador
  const browser = await chromium.launch({
    headless: false // Para ver lo que pasa
  });

  // 2. Crear contexto con credenciales HTTP
  const context = await browser.newContext({
    httpCredentials: {
      username: 'admin',           // Reemplaza con tu usuario real
      password: 'password123',     // Reemplaza con tu contraseña real
      origin: 'https://stake-brazil-fe.tgcloud.dev'
    }
  });

  // 3. Crear nueva página
  const page = await context.newPage();

  try {
    console.log('Navegando a la página...');
    
    // 4. Ir a la URL - la autenticación se maneja automáticamente
    await page.goto('https://stake-brazil-fe.tgcloud.dev');
    
    // 5. Esperar a que cargue
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Autenticación exitosa!');
    console.log('Título de la página:', await page.title());
    
    // 6. Ejemplo de interacciones después del login
    // Puedes hacer cualquier cosa aquí como si ya estuvieras logueado
    
    // Tomar screenshot
    await page.screenshot({ path: 'authenticated-page.png' });
    
    // Buscar elementos específicos
    const elements = await page.locator('h1').count();
    console.log(`Se encontraron ${elements} títulos h1`);
    
    // Ejemplo: hacer clic en algo
    // await page.click('button');
    
    // Ejemplo: llenar formulario
    // await page.fill('input[name="search"]', 'test');
    
    console.log('✅ Operaciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
    
    // Verificar si es error de autenticación
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('🔒 Error de autenticación - verifica las credenciales');
    }
    
  } finally {
    // 7. Cerrar navegador
    await browser.close();
  }
}

// Versión más simple y directa
async function simpleExample() {
  const browser = await chromium.launch();
  
  const context = await browser.newContext({
    httpCredentials: {
      username: 'tu_usuario_aqui',
      password: 'tu_password_aqui', 
      origin: 'https://stake-brazil-fe.tgcloud.dev'
    }
  });
  
  const page = await context.newPage();
  
  await page.goto('https://stake-brazil-fe.tgcloud.dev');
  
  // Ya estás autenticado - hacer lo que necesites
  console.log('Página cargada:', await page.url());
  
  await browser.close();
}

// Con variables de entorno (más seguro)
async function secureExample() {
  const browser = await chromium.launch();
  
  const context = await browser.newContext({
    httpCredentials: {
      username: process.env.STAKE_USERNAME || 'fallback_user',
      password: process.env.STAKE_PASSWORD || 'fallback_pass',
      origin: 'https://stake-brazil-fe.tgcloud.dev'
    }
  });
  
  const page = await context.newPage();
  await page.goto('https://stake-brazil-fe.tgcloud.dev');
  
  // Tu código aquí...
  
  await browser.close();
}

// Ejecutar el ejemplo principal
testStakeBrazil().catch(console.error);

// Para ejecutar desde línea de comandos:
// node tu_archivo.js

// O si usas variables de entorno:
// STAKE_USERNAME=usuario STAKE_PASSWORD=password node tu_archivo.js