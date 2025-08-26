const { chromium } = require('playwright');

async function testLogin() {
  console.log('🚀 Iniciando navegador...');
  
  const browser = await chromium.launch({
    headless: false // Para ver el proceso
  });

  const context = await browser.newContext({
    httpCredentials: {
      username: 'TU_USUARIO_AQUI',  // ⚠️ Cambiar por tu usuario real
      password: 'TU_PASSWORD_AQUI', // ⚠️ Cambiar por tu contraseña real
      origin: 'https://stake-brazil-fe.tgcloud.dev'
    }
  });

  const page = await context.newPage();

  try {
    console.log('🌐 Navegando a stake-brazil-fe.tgcloud.dev...');
    
    await page.goto('https://stake-brazil-fe.tgcloud.dev');
    
    console.log('⏳ Esperando que cargue la página...');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ ¡Autenticación exitosa!');
    console.log('📄 Título:', await page.title());
    console.log('🔗 URL actual:', page.url());
    
    // Tomar screenshot como prueba
    await page.screenshot({ path: 'login-exitoso.png' });
    console.log('📸 Screenshot guardado como login-exitoso.png');
    
    // Mantener abierto por 5 segundos para que puedas ver
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('🔒 Problema de autenticación - verifica usuario/contraseña');
    }
    
    // Screenshot del error
    await page.screenshot({ path: 'error.png' });
    
  } finally {
    await browser.close();
    console.log('🏁 Navegador cerrado');
  }
}

// Ejecutar
testLogin().catch(console.error);