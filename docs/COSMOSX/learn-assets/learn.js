function openIDE() {
  // For demo, show a sample Coslang story in the preview
  const sample = `#META
Title = CosmosX v2.9 Demo
Author = CosmosX Team
Version = 2.9

GLOBALS:
coins = 0
player_name = "Adventurer"

# Define macros
[macro heal]
[setstat health=health+10]
[LOG: "You feel refreshed!"]
[/macro]

[macro damage amount]
[setstat health=health-{1}]
[LOG: "You take {1} damage!"]
[/macro]

#SCENE start [showStats]
TEXT:
Welcome to CosmosX v2.9, {player_name}! You have {coins} coins.
[LOG: "Started adventure"]

STATS:
health = 15
mana = 10

CHOICES:
- Explore the temple => temple_scene
- Rest and recover [heal] => rest_scene
- Check inventory => inventory_scene

#SCENE temple_scene
TEXT:
You enter an ancient temple. [LOG: "Entered temple"]
[ROLL d20]
CHOICES:
- Fight the guardian [if getLastRoll() >= 12] [damage 5] => victory_scene
- Run away => escape_scene
- Cast magic [if mana >= 5] [set mana=mana-5] => magic_scene

#SCENE victory_scene
TEXT:
Victory! You defeated the guardian! [ACHIEVEMENT: first_victory]
[set coins=coins+10]
CHOICES:
- Continue => start

#SCENE rest_scene
TEXT:
You rest and recover your strength.
CHOICES:
- Continue => start

#SCENE escape_scene
TEXT:
You escape safely.
CHOICES:
- Return => start

#SCENE magic_scene
TEXT:
Your magic works! The guardian is weakened.
CHOICES:
- Continue => victory_scene

#SCENE inventory_scene
TEXT:
Your inventory is empty.
CHOICES:
- Return => start`;
  
  // In a real deployment, you could open the IDE in a new tab:
  // window.open('../../index.html', '_blank');
  
  // For now, show the sample in console
  console.log('Sample Coslang Story (v2.9):');
  console.log(sample);
  
  // Show in demo preview
  const demoPreview = document.getElementById('demoPreview');
  if (demoPreview) {
    demoPreview.textContent = sample;
  }
  
  // You could also show it in a modal or alert
  alert('Sample Coslang story (v2.9) loaded! Check the preview below and open the IDE to start creating your own stories.');
} 