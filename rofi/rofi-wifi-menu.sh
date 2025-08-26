#!/bin/bash

# Script para mostrar redes WiFi disponibles con rofi
# Guarda este archivo como ~/.config/rofi/rofi-wifi-menu.sh y dale permisos de ejecución

# Verificar si NetworkManager está disponible
if ! command -v nmcli &> /dev/null; then
    echo "NetworkManager (nmcli) no está instalado"
    exit 1
fi

# Función para mostrar notificación
notify() {
    if command -v notify-send &> /dev/null; then
        notify-send "WiFi" "$1" -i network-wireless
    fi
}

# Función para obtener redes WiFi
get_wifi_networks() {
    nmcli -t -f SSID,SIGNAL,SECURITY device wifi list | \
    awk -F: '
    $1 != "" && $1 != "--" {
        security = ($3 == "") ? "🔓" : "🔒"
        signal = $2
        if (signal >= 75) strength = "▰▰▰▰"
        else if (signal >= 50) strength = "▰▰▰▱"
        else if (signal >= 25) strength = "▰▰▱▱"
        else strength = "▰▱▱▱"
        
        printf "%s  %s  %s  %s%%\n", security, $1, strength, signal
    }' | sort -k4 -nr | head -20
}

# Función para obtener red actual
get_current_network() {
    current=$(nmcli -t -f NAME connection show --active | grep -v '^lo$' | head -1)
    if [ -n "$current" ]; then
        echo "🔗 Desconectar de: $current"
    fi
}

# Función principal
main() {
    # Verificar estado del WiFi
    wifi_status=$(nmcli radio wifi)
    
    if [ "$wifi_status" = "disabled" ]; then
        action=$(echo -e "📶 Activar WiFi\n🚫 Cancelar" | rofi -dmenu -p "WiFi está desactivado")
        
        case "$action" in
            "📶 Activar WiFi")
                nmcli radio wifi on
                notify "WiFi activado"
                sleep 2
                ;;
            *)
                exit 0
                ;;
        esac
    fi
    
    # Crear menú
    menu_items=""
    
    # Añadir opción de actualizar
    menu_items+="🔄 Actualizar lista\n"
    
    # Añadir red actual si está conectada
    current_network=$(get_current_network)
    if [ -n "$current_network" ]; then
        menu_items+="$current_network\n"
    fi
    
    # Separador
    menu_items+="────────────────\n"
    
    # Añadir redes disponibles
    wifi_networks=$(get_wifi_networks)
    if [ -n "$wifi_networks" ]; then
        menu_items+="$wifi_networks\n"
    else
        menu_items+="❌ No se encontraron redes\n"
    fi
    
    # Opciones adicionales
    menu_items+="────────────────\n"
    menu_items+="⚙️ Abrir Network Manager\n"
    menu_items+="📶 Desactivar WiFi\n"
    
    # Mostrar menú
    selected=$(echo -e "$menu_items" | rofi -dmenu -p "Seleccionar red WiFi" -i -no-custom)
    
    # Procesar selección
    case "$selected" in
        "🔄 Actualizar lista")
            nmcli device wifi rescan
            notify "Lista de redes actualizada"
            exec "$0"
            ;;
        "🔗 Desconectar de:"*)
            network_name=$(echo "$selected" | sed 's/🔗 Desconectar de: //')
            nmcli connection down "$network_name"
            notify "Desconectado de $network_name"
            ;;
        "⚙️ Abrir Network Manager")
            nm-connection-editor &
            ;;
        "📶 Desactivar WiFi")
            nmcli radio wifi off
            notify "WiFi desactivado"
            ;;
        "❌ No se encontraron redes"|"────────────────"|"")
            exit 0
            ;;
        *)
            if [ -n "$selected" ]; then
                # Extraer nombre de la red (quitar iconos y información adicional)
                network_name=$(echo "$selected" | awk '{for(i=2;i<=NF-2;i++) printf "%s ", $i; print ""}' | sed 's/ $//')
                
                # Verificar si la red requiere contraseña
                if echo "$selected" | grep -q "🔒"; then
                    password=$(rofi -dmenu -password -p "Contraseña para $network_name")
                    if [ -n "$password" ]; then
                        if nmcli device wifi connect "$network_name" password "$password"; then
                            notify "Conectado a $network_name"
                        else
                            notify "Error al conectar a $network_name"
                        fi
                    fi
                else
                    if nmcli device wifi connect "$network_name"; then
                        notify "Conectado a $network_name"
                    else
                        notify "Error al conectar a $network_name"
                    fi
                fi
            fi
            ;;
    esac
}

main
