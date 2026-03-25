using System.Security.Claims;
using LanguageCoach.Application.Commands;
using LanguageCoach.Application.DTOs;
using LanguageCoach.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanguageCoach.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VocabularyController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<VocabularyController> _logger;

    public VocabularyController(IMediator mediator, ILogger<VocabularyController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!);
    }

    [HttpGet]
    public async Task<ActionResult<VocabularyListDto>> GetVocabulary(
        [FromQuery] string? languageCode = null,
        [FromQuery] string? status = null,
        [FromQuery] string? searchTerm = null)
    {
        var query = new GetVocabularyQuery(GetCurrentUserId(), languageCode, status, searchTerm);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<VocabularyStatsDto>> GetStats([FromQuery] string? languageCode = null)
    {
        var query = new GetVocabularyStatsQuery(GetCurrentUserId(), languageCode);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("review")]
    public async Task<ActionResult<IEnumerable<ReviewSessionDto>>> GetReviewSession(
        [FromQuery] string languageCode,
        [FromQuery] int count = 10)
    {
        var query = new GetReviewSessionQuery(GetCurrentUserId(), languageCode, count);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("due")]
    public async Task<ActionResult<IEnumerable<VocabularyItemDto>>> GetDueForReview(
        [FromQuery] string languageCode,
        [FromQuery] int limit = 20)
    {
        var query = new GetDueForReviewQuery(GetCurrentUserId(), languageCode, limit);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<VocabularyItemDto>>> Search(
        [FromQuery] string term,
        [FromQuery] string? languageCode = null)
    {
        var query = new SearchVocabularyQuery(GetCurrentUserId(), term, languageCode);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VocabularyItemDto>> GetItem(Guid id)
    {
        var query = new GetVocabularyItemQuery(GetCurrentUserId(), id);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
        
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<VocabularyItemDto>> Create([FromBody] CreateVocabularyRequest request)
    {
        var command = new CreateVocabularyCommand(
            GetCurrentUserId(),
            request.LanguageCode,
            request.Word,
            request.Translation,
            request.Definition,
            request.PartOfSpeech,
            request.ContextPhrase);
        
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetItem), new { id = result.Id }, result);
    }

    [HttpPost("quick-add")]
    public async Task<ActionResult<VocabularyItemDto>> QuickAdd([FromBody] QuickAddVocabularyRequest request)
    {
        var command = new QuickAddVocabularyCommand(
            GetCurrentUserId(),
            request.LanguageCode,
            request.Word,
            request.ContextPhrase);
        
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<VocabularyItemDto>> Update(Guid id, [FromBody] UpdateVocabularyRequest request)
    {
        var command = new UpdateVocabularyCommand(GetCurrentUserId(), id, request.Status, request.Translation, request.Definition);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<VocabularyItemDto>> Review(Guid id, [FromBody] ReviewVocabularyRequest request)
    {
        var command = new ReviewVocabularyCommand(GetCurrentUserId(), id, request.WasCorrect, request.ConfidenceLevel);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var command = new DeleteVocabularyCommand(GetCurrentUserId(), id);
        var result = await _mediator.Send(command);
        
        if (!result)
            return NotFound();
        
        return NoContent();
    }

    [HttpPost("extract/{conversationId:guid}/{messageId:guid}")]
    public async Task<ActionResult<List<ExtractedVocabularyDto>>> ExtractFromMessage(
        Guid conversationId, 
        Guid messageId)
    {
        var command = new ExtractVocabularyFromMessageCommand(GetCurrentUserId(), conversationId, messageId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
