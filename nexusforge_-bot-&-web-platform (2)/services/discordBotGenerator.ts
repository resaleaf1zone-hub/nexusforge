import type { BotConfig } from '../types';

const formatPython = (obj: any): string => {
  if (obj === null) return 'None';
  if (typeof obj === 'string') return `'${obj.replace(/'/g, "\\'")}'`;
  if (typeof obj === 'boolean') return obj ? 'True' : 'False';
  if (typeof obj === 'number') return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(formatPython).join(', ')}]`;
  if (typeof obj === 'object' && obj !== null) {
    const pairs = Object.entries(obj).map(([k, v]) => `${formatPython(k)}: ${formatPython(v)}`);
    return `{${pairs.join(', ')}}`;
  }
  return String(obj);
};

export const generateBotCode = (config: BotConfig): string => {
  const hasWelcome = config.features.welcomeMessage.enabled;
  const hasModeration = config.features.moderation.enabled;
  const hasTickets = config.features.ticketSystem.enabled;
  const hasScraper = config.features.imageScraper;
  const hasLogging = config.features.logging.enabled;
  
  const code = `
# NexusForge Generated Bot
# To run this bot:
# 1. Make sure you have Python installed.
# 2. Install the required libraries:
#    pip install discord.py python-dotenv beautifulsoup4 requests
# 3. Create a file named ".env" in the same directory as this script.
# 4. Inside the .env file, add the line: DISCORD_TOKEN='YOUR_BOT_TOKEN_HERE'
#    (Replace 'YOUR_BOT_TOKEN_HERE' with your actual bot token)
# 5. If you haven't put your token in the config on the website, replace it in the TOKEN variable below.
# 6. Run the bot from your terminal: python your_bot_file_name.py

import discord
from discord.ext import commands
import os
import requests
import asyncio
from datetime import datetime
from dotenv import load_dotenv
${hasTickets && config.features.ticketSystem.transcripts ? "from io import StringIO" : ""}
${hasScraper ? `import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin` : ""}

# --- Configuration ---
load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN', '${config.token || 'YOUR_BOT_TOKEN_HERE'}')
SCRAPER_ENDPOINT = '${config.scraperEndpoint}'
ADMIN_ROLE = '${config.features.moderation.adminRole || 'Moderator'}'

# --- Bot Setup ---
intents = discord.Intents.default()
intents.members = True
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# --- Helper Functions ---
${hasLogging ? `
async def log_action(guild, action, user, reason=None):
    log_channel_name = '${config.features.logging.channel}'
    if not log_channel_name:
        return
    log_channel = discord.utils.get(guild.text_channels, name=log_channel_name)
    if log_channel:
        embed = discord.Embed(
            title=f'Action: {action}',
            color=discord.Color.orange(),
            timestamp=datetime.utcnow()
        )
        embed.add_field(name='User', value=user.mention, inline=False)
        if reason:
            embed.add_field(name='Reason', value=reason, inline=False)
        await log_channel.send(embed=embed)
` : `
async def log_action(guild, action, user, reason=None):
    # Logging is disabled, so this function does nothing.
    pass
`}

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user.name}')
    print('Bot is ready to go!')
${hasTickets ? `
    print("Loading persistent ticket views...")
    try:
        for panel_config in TICKET_PANELS:
            bot.add_view(TicketCreationView(panel_config))
        print(f"Loaded {len(TICKET_PANELS)} persistent ticket panels.")
    except Exception as e:
        print(f"Error loading ticket panels: {e}")
` : ''}

# --- Features ---
${hasWelcome ? `
@bot.event
async def on_member_join(member):
    channel_name = '${config.features.welcomeMessage.channel.replace("#", "")}'
    if not channel_name:
        return
    channel = discord.utils.get(member.guild.text_channels, name=channel_name)
    if channel:
        welcome_message = f"""${config.features.welcomeMessage.message.replace('{user}', '{member.mention}')}"""
        await channel.send(welcome_message)
` : ''}

${hasModeration ? `
@bot.command()
@commands.has_role(ADMIN_ROLE)
async def kick(ctx, member: discord.Member, *, reason='No reason provided'):
    await member.kick(reason=reason)
    await ctx.send(f'Kicked {member.mention}. Reason: {reason}')
    await log_action(ctx.guild, 'Kick', member, reason)

@bot.command()
@commands.has_role(ADMIN_ROLE)
async def ban(ctx, member: discord.Member, *, reason='No reason provided'):
    await member.ban(reason=reason)
    await ctx.send(f'Banned {member.mention}. Reason: {reason}')
    await log_action(ctx.guild, 'Ban', member, reason)

@bot.command()
@commands.has_permissions(manage_messages=True)
async def clear(ctx, amount=5):
    await ctx.channel.purge(limit=amount + 1)
    await ctx.send(f'Cleared {amount} messages.', delete_after=5)

@kick.error
@ban.error
async def moderation_error(ctx, error):
    if isinstance(error, commands.MissingRole):
        await ctx.send(f"You don't have the required role ('{ADMIN_ROLE}') to use this command.")
` : ''}

${hasTickets ? `
# --- Ticket System ---
TICKET_PANELS = ${formatPython(config.features.ticketSystem.panels)}
TICKET_TRANSCRIPTS_ENABLED = ${config.features.ticketSystem.transcripts ? 'True' : 'False'}
TICKET_TRANSCRIPTS_CHANNEL = '${config.features.ticketSystem.transcriptChannel}'

class TicketCreationView(discord.ui.View):
    def __init__(self, panel_config: dict):
        super().__init__(timeout=None)
        self.panel_config = panel_config
        self.add_item(discord.ui.Button(
            label=self.panel_config.get('buttonText', 'Create Ticket'),
            emoji=self.panel_config.get('buttonEmoji'),
            style=discord.ButtonStyle.primary,
            custom_id=f"create_ticket_{self.panel_config['id']}"
        ))

async def handle_ticket_creation(interaction: discord.Interaction):
    try:
        if not (interaction.type == discord.InteractionType.component and interaction.data['custom_id'].startswith('create_ticket_')):
            return

        panel_id = interaction.data['custom_id'].split('_')[-1]
        panel_config = next((p for p in TICKET_PANELS if p['id'] == panel_id), None)
        
        if not panel_config:
            await interaction.response.send_message("Error: Ticket panel configuration not found.", ephemeral=True)
            return

        await interaction.response.defer(ephemeral=True, thinking=True)

        guild = interaction.guild
        category_name = panel_config.get('category')
        if not category_name:
            await interaction.followup.send(f"Error: Ticket category not configured.", ephemeral=True)
            return
            
        category = discord.utils.get(guild.categories, name=category_name)
        if not category:
            await interaction.followup.send(f"Error: Category '{category_name}' not found.", ephemeral=True)
            return

        ticket_channel_name = f"ticket-{interaction.user.name.lower().replace(' ', '-')}"
        existing_channel = discord.utils.get(guild.text_channels, name=ticket_channel_name, category=category)
        if existing_channel:
            await interaction.followup.send(f"You already have a ticket open: {existing_channel.mention}", ephemeral=True)
            return

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            interaction.user: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_messages=True),
            bot.user: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_messages=True)
        }
        
        support_roles = []
        for role_name in panel_config.get('supportRoles', []):
            role = discord.utils.get(guild.roles, name=role_name)
            if role:
                overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_messages=True)
                support_roles.append(role.mention)

        ticket_channel = await guild.create_text_channel(
            name=ticket_channel_name,
            category=category,
            overwrites=overwrites,
            topic=f"Ticket for {interaction.user.name}. Panel: {panel_config.get('title', 'Support')}"
        )

        welcome_message = panel_config.get('welcomeMessage', 'Welcome {user}!').replace('{user}', interaction.user.mention)
        support_roles_mention = ' '.join(support_roles) if support_roles else ''
        
        embed = discord.Embed(
            title=f"Ticket Created: {panel_config.get('title', 'Support')}",
            description=welcome_message,
            color=discord.Color.green()
        )
        embed.set_footer(text=f"Ticket for {interaction.user.name}")
        
        await ticket_channel.send(content=f"{interaction.user.mention} {support_roles_mention}", embed=embed)
        await interaction.followup.send(f"Your ticket has been created: {ticket_channel.mention}", ephemeral=True)

    except Exception as e:
        print(f"Error during interaction: {e}")
        try:
            await interaction.followup.send("An unexpected error occurred while creating your ticket. Please contact an admin.", ephemeral=True)
        except discord.errors.InteractionResponded:
            pass # Already responded

@bot.event
async def on_interaction(interaction: discord.Interaction):
    await handle_ticket_creation(interaction)
    # If you have other interaction handlers, you can call them here
    # await bot.process_application_commands(interaction) # if using slash commands


@bot.command()
@commands.has_permissions(administrator=True)
async def setup_tickets(ctx):
    """Sets up the ticket panels in their configured channels."""
    for panel_config in TICKET_PANELS:
        channel_name = panel_config.get('channel', '').replace('#', '')
        if not channel_name:
            continue
        channel = discord.utils.get(ctx.guild.text_channels, name=channel_name)
        if channel:
            embed = discord.Embed(
                title=panel_config.get('title', 'Support'),
                description=panel_config.get('description', 'Click to create a ticket.'),
                color=discord.Color.blue()
            )
            view = TicketCreationView(panel_config)
            await channel.send(embed=embed, view=view)
    await ctx.message.add_reaction('✅')
    await asyncio.sleep(5)
    await ctx.message.delete()

@bot.command()
async def close(ctx):
    """Closes the current ticket channel."""
    if ctx.channel.name.startswith('ticket-'):
        if TICKET_TRANSCRIPTS_ENABLED:
            transcript_channel = discord.utils.get(ctx.guild.text_channels, name=TICKET_TRANSCRIPTS_CHANNEL)
            if transcript_channel:
                await ctx.send("Saving transcript and closing ticket...")
                messages = []
                async for msg in ctx.channel.history(limit=None, oldest_first=True):
                    messages.append(f"[{msg.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {msg.author.name}: {msg.content}")
                
                transcript_content = "\\n".join(messages)
                
                file = discord.File(StringIO(transcript_content), filename=f"transcript-{ctx.channel.name}.txt")
                await transcript_channel.send(f"Transcript for closed ticket from {ctx.channel.topic}:", file=file)

        await ctx.send("Closing ticket in 5 seconds...")
        await asyncio.sleep(5)
        await ctx.channel.delete(reason="Ticket closed.")
    else:
        await ctx.send("This command can only be used in a ticket channel.", delete_after=10)
` : ''}

${hasScraper ? `
@bot.command()
async def grabimages(ctx, link: str):
    """Scrapes product images from a bbdbuy.com link."""
    if 'bbdbuy.com' not in link:
        await ctx.send('Please provide a valid bbdbuy.com product link.')
        return

    await ctx.send(f'🔎 Scraping images from link... please wait.')
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(link, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        image_urls = set()
        
        # Search for images in common product gallery containers
        image_containers = soup.select('.product-small-picture a, .gallery-picture a, .product-essential .product-img-box .product-image a')

        for container in image_containers:
            img = container.find('img')
            # Prioritize href from parent 'a', then data-src, then src
            src = container.get('href') or (img and img.get('data-src')) or (img and img.get('src'))
            if src:
                # Clean URL: remove size suffixes to get full resolution
                cleaned_url = re.sub(r'_\\d+x\\d+\\.(jpg|jpeg|png|webp)$', r'.\\1', src)
                if not cleaned_url.startswith(('http:', 'https:')):
                    cleaned_url = urljoin(link, cleaned_url)
                image_urls.add(cleaned_url)

        image_urls = list(image_urls)

        if not image_urls:
            await ctx.send('Could not find any product images on that page.')
            return
        
        await ctx.send(f'✅ Found {len(image_urls)} unique image(s). Posting up to 8.')

        for url in image_urls[:8]:
            embed = discord.Embed(color=discord.Color.green())
            embed.set_image(url=url)
            await ctx.send(embed=embed)
    
    except requests.exceptions.RequestException:
        await ctx.send(f'Sorry, I could not fetch the page. It might be down or the link is incorrect.')
    except Exception as e:
        print(f"Scraper error: {e}")
        await ctx.send(f'An unexpected error occurred during scraping. Please check the logs.')
` : ''}

# --- Custom Commands ---
${config.customCommands.map(cmd => `
@bot.command(name='${cmd.trigger}')
async def _${cmd.trigger.replace('-', '_')}(ctx):
    await ctx.send("""${cmd.response.replace(/'/g, "\\'")}""")
`).join('\n')}

# --- Run Bot ---
if TOKEN == 'YOUR_BOT_TOKEN_HERE' or not TOKEN:
    print('ERROR: Bot token is not set. Please set it in the code or as a DISCORD_TOKEN environment variable in a .env file.')
else:
    try:
        bot.run(TOKEN)
    except discord.errors.LoginFailure:
        print("ERROR: Failed to log in. Please ensure your bot token is correct.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
  `;

  return code.trim();
};