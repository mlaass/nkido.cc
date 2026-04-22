<script lang="ts">
	import { Github, Heart } from 'lucide-svelte';
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-top">
			<div class="footer-links">
				<a href="/community">Community</a>
				<span class="divider">·</span>
				<a href="/press">Press</a>
				<span class="divider">·</span>
				<a href="https://github.com/mlaass/nkido" target="_blank" rel="noopener">GitHub</a>
			</div>

			<div class="footer-sponsor">
				<a href="https://github.com/sponsors/mlaass" target="_blank" rel="noopener">
					<Heart size={14} />
					Sponsor
				</a>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="footer-copy">
				MIT License · © {new Date().getFullYear()} nkido
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-muted);
		padding: var(--spacing-lg) 0;
		margin-top: auto;
	}

	.footer-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--content-padding);
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.footer-links {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.footer-links a {
		color: var(--text-secondary);
	}

	.footer-links a:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	.divider {
		color: var(--text-muted);
	}

	.footer-sponsor a {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--accent-secondary);
		font-size: 0.875rem;
	}

	.footer-sponsor a:hover {
		text-decoration: none;
	}

	.footer-bottom {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	@media (max-width: 480px) {
		.footer-top {
			flex-direction: column;
			gap: var(--spacing-md);
			text-align: center;
		}

		.footer-links {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>