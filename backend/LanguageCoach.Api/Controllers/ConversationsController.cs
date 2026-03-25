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
public class ConversationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ConversationsController> _logger;

    public ConversationsController(IMediator mediator, ILogger<ConversationsController> logger)
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
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations(
        [FromQuery] string? languageCode = null,
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        var query = new GetConversationsQuery(GetCurrentUserId(), languageCode, limit, offset);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetActiveConversations()
    {
        var query = new GetActiveConversationsQuery(GetCurrentUserId());
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ConversationStatsDto>> GetStats([FromQuery] string? languageCode = null)
    {
        var query = new GetConversationStatsQuery(GetCurrentUserId(), languageCode);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ConversationDetailDto>> GetConversation(Guid id)
    {
        var query = new GetConversationDetailQuery(GetCurrentUserId(), id);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
        
        return Ok(result);
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(
        Guid id, 
        [FromQuery] int limit = 50)
    {
        var query = new GetConversationMessagesQuery(GetCurrentUserId(), id, limit);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ConversationDto>> StartConversation([FromBody] StartConversationRequest request)
    {
        var command = new StartConversationCommand(
            GetCurrentUserId(),
            request.LanguageCode,
            request.Type,
            request.Scenario,
            request.Title);
        
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetConversation), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult<SendMessageResponse>> SendMessage(
        Guid id, 
        [FromBody] SendMessageRequest request)
    {
        var command = new SendMessageCommand(
            GetCurrentUserId(),
            id,
            request.Content,
            request.RequestCorrection);
        
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteConversation(Guid id)
    {
        var command = new CompleteConversationCommand(GetCurrentUserId(), id);
        var result = await _mediator.Send(command);
        
        if (!result)
            return NotFound();
        
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteConversation(Guid id)
    {
        var command = new DeleteConversationCommand(GetCurrentUserId(), id);
        var result = await _mediator.Send(command);
        
        if (!result)
            return NotFound();
        
        return NoContent();
    }
}
